import _ from 'underscore'
import { PartInstance, PartInstanceId } from '../collections/PartInstances'
import { PieceInstance, PieceInstancePiece, rewrapPieceToInstance } from '../collections/PieceInstances'
import { DBPart, PartId, Part } from '../collections/Parts'
import { Piece } from '../collections/Pieces'
import { SegmentId } from '../collections/Segments'
import { PieceLifespan } from 'tv-automation-sofie-blueprints-integration'
import { assertNever, max, flatten, literal } from '../lib'
import { Mongo } from 'meteor/mongo'
import { Studio } from '../collections/Studios'
import { ShowStyleBase } from '../collections/ShowStyleBases'

export function buildPiecesStartingInThisPartQuery(part: DBPart): Mongo.Query<Piece> {
	return { startPartId: part._id }
}

export function buildPastInfinitePiecesForThisPartQuery(
	part: DBPart,
	partsIdsBeforeThisInSegment: PartId[],
	segmentsIdsBeforeThisInRundown: SegmentId[]
): Mongo.Query<Piece> {
	return {
		invalid: { $ne: true },
		startPartId: { $ne: part._id },
		$or: [
			{
				// same segment, and previous part
				lifespan: {
					$in: [
						PieceLifespan.OutOnSegmentEnd,
						PieceLifespan.OutOnSegmentChange,
						PieceLifespan.OutOnRundownEnd,
						PieceLifespan.OutOnRundownChange,
					],
				},
				startRundownId: part.rundownId,
				startSegmentId: part.segmentId,
				startPartId: { $in: partsIdsBeforeThisInSegment },
			},
			{
				// same rundown, and previous segment
				lifespan: { $in: [PieceLifespan.OutOnRundownEnd, PieceLifespan.OutOnRundownChange] },
				startRundownId: part.rundownId,
				startSegmentId: { $in: segmentsIdsBeforeThisInRundown },
			},
			// {
			// 	// previous rundown
			//  // Potential future scope
			// }
		],
	}
}

export function getPlayheadTrackingInfinitesForPart(
	partsBeforeThisInSegmentSet: Set<PartId>,
	segmentsBeforeThisInRundownSet: Set<SegmentId>,
	currentPartInstance: PartInstance,
	currentPartPieceInstances: PieceInstance[],
	part: DBPart,
	newInstanceId: PartInstanceId,
	nextPartIsAfterCurrentPart: boolean,
	isTemporary: boolean
): PieceInstance[] {
	const canContinueAdlibOnEnds = nextPartIsAfterCurrentPart
	interface InfinitePieceSet {
		[PieceLifespan.OutOnRundownEnd]?: PieceInstance
		[PieceLifespan.OutOnSegmentEnd]?: PieceInstance
		onChange?: PieceInstance
	}
	const piecesOnSourceLayers = new Map<string, InfinitePieceSet>()

	const groupedPlayingPieceInstances = _.groupBy(currentPartPieceInstances, (p) => p.piece.sourceLayerId)
	for (const [sourceLayerId, pieceInstances] of Object.entries(groupedPlayingPieceInstances)) {
		// Find the one that starts last. Note: any piece will stop an onChange
		const lastPieceInstance =
			pieceInstances.find((p) => p.piece.enable.start === 'now') ??
			max(pieceInstances, (p) => p.piece.enable.start)
		if (lastPieceInstance) {
			// If it is an onChange, then it may want to continue
			let isUsed = false
			switch (lastPieceInstance.piece.lifespan) {
				case PieceLifespan.OutOnSegmentChange:
					if (currentPartInstance?.segmentId === part.segmentId) {
						// Still in the same segment
						isUsed = true
					}
					break
				case PieceLifespan.OutOnRundownChange:
					if (lastPieceInstance.rundownId === part.rundownId) {
						// Still in the same rundown
						isUsed = true
					}
					break
			}

			if (isUsed) {
				const pieceSet = piecesOnSourceLayers.get(sourceLayerId) ?? {}
				pieceSet.onChange = lastPieceInstance
				piecesOnSourceLayers.set(sourceLayerId, pieceSet)
				// This may get pruned later, if somethng else has a start of 0
			}
		}

		// Check if we should persist any adlib onEnd infinites
		if (canContinueAdlibOnEnds) {
			const piecesByInfiniteMode = _.groupBy(pieceInstances, (p) => p.piece.lifespan)
			for (const mode0 of [PieceLifespan.OutOnRundownEnd, PieceLifespan.OutOnSegmentEnd]) {
				const mode = mode0 as PieceLifespan.OutOnRundownEnd | PieceLifespan.OutOnSegmentEnd
				const pieces = (piecesByInfiniteMode[mode] || []).filter(
					(p) => p.infinite?.fromPrevious || p.dynamicallyInserted
				)
				// This is the piece we may copy across
				const candidatePiece =
					pieces.find((p) => p.piece.enable.start === 'now') ?? max(pieces, (p) => p.piece.enable.start)
				if (candidatePiece) {
					// Check this infinite is allowed to continue to this part
					let isValid = false
					switch (mode) {
						case PieceLifespan.OutOnSegmentEnd:
							isValid =
								currentPartInstance.segmentId === part.segmentId &&
								partsBeforeThisInSegmentSet.has(candidatePiece.piece.startPartId)
							break
						case PieceLifespan.OutOnRundownEnd:
							isValid =
								candidatePiece.rundownId === part.rundownId &&
								(segmentsBeforeThisInRundownSet.has(currentPartInstance.segmentId) ||
									currentPartInstance.segmentId === part.segmentId)
							break
					}

					if (isValid) {
						// we need to check it should be masked by another infinite
						const pieceSet = piecesOnSourceLayers.get(sourceLayerId) ?? {}
						const currentPiece = pieceSet[mode]
						if (currentPiece) {
							// Which should we use?
							// TODO-INFINITES when should the adlib take priority over preprogrammed?
						} else {
							// There isnt a conflict, so its easy
							pieceSet[mode] = candidatePiece
							piecesOnSourceLayers.set(sourceLayerId, pieceSet)
						}
					}
				}
			}
		}
	}

	const rewrapInstance = (p: PieceInstance) => {
		const instance = rewrapPieceToInstance(p.piece, part.rundownId, newInstanceId, isTemporary)

		// instance.infinite = p.infinite
		if (p.infinite) {
			// This was copied from before, so we know we can force the time to 0
			instance.piece = {
				...instance.piece,
				enable: {
					start: 0,
				},
			}
			instance.infinite = {
				...p.infinite,
				fromPrevious: true,
			}
		}

		return instance
	}

	return flatten(
		Array.from(piecesOnSourceLayers.values()).map((ps) => {
			return _.compact(Object.values(ps)).map(rewrapInstance)
		})
	)
}

export function isPiecePotentiallyActiveInPart(
	previousPartInstance: PartInstance | undefined,
	partsBeforeThisInSegment: Set<PartId>,
	segmentsBeforeThisInRundown: Set<SegmentId>,
	part: DBPart,
	pieceToCheck: Piece
): boolean {
	// If its from the current part
	if (pieceToCheck.startPartId === part._id) {
		return true
	}

	switch (pieceToCheck.lifespan) {
		case PieceLifespan.WithinPart:
			// This must be from another part
			return false
		case PieceLifespan.OutOnSegmentEnd:
			return (
				pieceToCheck.startSegmentId === part.segmentId && partsBeforeThisInSegment.has(pieceToCheck.startPartId)
			)
		case PieceLifespan.OutOnRundownEnd:
			return (
				pieceToCheck.startRundownId === part.rundownId &&
				segmentsBeforeThisInRundown.has(pieceToCheck.startSegmentId)
			)
		case PieceLifespan.OutOnSegmentChange:
			if (previousPartInstance !== undefined) {
				// This gets handled by getPlayheadTrackingInfinitesForPart
				// We will only copy the pieceInstance from the previous, never using the original piece
				return false
			} else {
				// Predicting what will happen at arbitrary point in the future
				return (
					pieceToCheck.startSegmentId === part.segmentId &&
					partsBeforeThisInSegment.has(pieceToCheck.startPartId)
				)
			}
		case PieceLifespan.OutOnRundownChange:
			if (previousPartInstance !== undefined) {
				// This gets handled by getPlayheadTrackingInfinitesForPart
				// We will only copy the pieceInstance from the previous, never using the original piece
				return false
			} else {
				// Predicting what will happen at arbitrary point in the future
				return (
					pieceToCheck.startRundownId === part.rundownId &&
					segmentsBeforeThisInRundown.has(pieceToCheck.startSegmentId)
				)
			}
		default:
			assertNever(pieceToCheck.lifespan)
			return false
	}
}

export function getPieceInstancesForPart(
	playingPartInstance: PartInstance | undefined,
	playingPieceInstances: PieceInstance[] | undefined,
	part: DBPart,
	partsBeforeThisInSegmentSet: Set<PartId>,
	segmentsBeforeThisInRundownSet: Set<SegmentId>,
	possiblePieces: Piece[],
	orderedPartIds: PartId[],
	newInstanceId: PartInstanceId,
	nextPartIsAfterCurrentPart: boolean,
	isTemporary: boolean
): PieceInstance[] {
	const doesPieceAStartBeforePieceB = (pieceA: PieceInstancePiece, pieceB: PieceInstancePiece): boolean => {
		if (pieceA.startPartId === pieceB.startPartId) {
			return pieceA.enable.start < pieceB.enable.start
		}
		const pieceAIndex = orderedPartIds.indexOf(pieceA.startPartId)
		const pieceBIndex = orderedPartIds.indexOf(pieceB.startPartId)

		if (pieceAIndex === -1) {
			return false
		} else if (pieceBIndex === -1) {
			return true
		} else if (pieceAIndex < pieceBIndex) {
			return true
		} else {
			return false
		}
	}

	interface InfinitePieceSet {
		[PieceLifespan.OutOnRundownEnd]?: Piece
		[PieceLifespan.OutOnSegmentEnd]?: Piece
		// onChange?: PieceInstance
	}
	const piecesOnSourceLayers = new Map<string, InfinitePieceSet>()

	// Filter down to the last starting onEnd infinite per layer
	for (const candidatePiece of possiblePieces) {
		if (
			candidatePiece.startPartId !== part._id &&
			(candidatePiece.lifespan === PieceLifespan.OutOnRundownEnd ||
				candidatePiece.lifespan === PieceLifespan.OutOnSegmentEnd)
		) {
			const useIt = isPiecePotentiallyActiveInPart(
				playingPartInstance,
				partsBeforeThisInSegmentSet,
				segmentsBeforeThisInRundownSet,
				part,
				candidatePiece
			)

			if (useIt) {
				const pieceSet = piecesOnSourceLayers.get(candidatePiece.sourceLayerId) ?? {}
				const existingPiece = pieceSet[candidatePiece.lifespan]
				if (!existingPiece || doesPieceAStartBeforePieceB(existingPiece, candidatePiece)) {
					pieceSet[candidatePiece.lifespan] = candidatePiece
					piecesOnSourceLayers.set(candidatePiece.sourceLayerId, pieceSet)
				}
			}
		}
	}

	// OnChange infinites take priority over onEnd, as they travel with the playhead
	const infinitesFromPrevious = playingPartInstance
		? getPlayheadTrackingInfinitesForPart(
				partsBeforeThisInSegmentSet,
				segmentsBeforeThisInRundownSet,
				playingPartInstance,
				playingPieceInstances || [],
				part,
				newInstanceId,
				nextPartIsAfterCurrentPart,
				isTemporary
		  )
		: []

	// Compile the resulting list

	const wrapPiece = (p: PieceInstancePiece) => {
		const instance = rewrapPieceToInstance(p, part.rundownId, newInstanceId, isTemporary)

		if (!instance.infinite && instance.piece.lifespan !== PieceLifespan.WithinPart) {
			instance.infinite = {
				infinitePieceId: instance.piece._id,
			}
		}
		if (instance.infinite && instance.piece.startPartId !== part._id) {
			// If this is not the start point, it should start at 0
			instance.piece = {
				...instance.piece,
				enable: {
					start: 0,
				},
			}
		}

		return instance
	}

	const normalPieces = possiblePieces.filter((p) => p.startPartId === part._id)
	const result = normalPieces.map(wrapPiece).concat(infinitesFromPrevious)
	for (const pieceSet of Array.from(piecesOnSourceLayers.values())) {
		const basicPieces = _.compact([
			pieceSet[PieceLifespan.OutOnRundownEnd],
			pieceSet[PieceLifespan.OutOnSegmentEnd],
		])
		result.push(...basicPieces.map(wrapPiece))

		// if (pieceSet.onChange) {
		// 	result.push(rewrapInstance(pieceSet.onChange))
		// }
	}

	return result
}

export interface PieceInstanceWithTimings extends PieceInstance {
	// resolvedStart: number | 'now' // TODO - document that this is the value to use, not a bounds (and is identical to piece.enable.start)
	resolvedEndCap?: number | 'now' // TODO - document that this is value is a bounds, not the value to use
	priority: number
}

/**
 * Process the infinite pieces to determine the start time and a maximum end time for each.
 * Any pieces which have no chance of being shown (duplicate start times) are pruned
 * The stacking order of infinites is considered, to define the stop times
 */
export function processAndPrunePieceInstanceTimings(
	showStyle: ShowStyleBase,
	pieces: PieceInstance[],
	nowInPart: number
): PieceInstanceWithTimings[] {
	const result: PieceInstanceWithTimings[] = []

	let activePieces: PieceInstanceOnInfiniteLayers = {}
	const updateWithNewPieces = (
		newPieces: PieceInstanceOnInfiniteLayers,
		key: keyof PieceInstanceOnInfiniteLayers,
		start: number | 'now'
	): void => {
		const newPiece = newPieces[key]
		if (newPiece) {
			const activePiece = activePieces[key]
			if (activePiece) {
				activePiece.resolvedEndCap = start
			}
			activePieces[key] = newPiece
			result.push(newPiece)

			if (activePieces.other) {
				if (key === 'onSegmentEnd' || (key === 'onRundownEnd' && !activePieces.onSegmentEnd)) {
					// These modes should stop the 'other' when they start if not hidden behind a high priority onEnd
					activePieces.other.resolvedEndCap = start
					activePieces.other = undefined
				}
			}
		}
	}

	// We want to group by exclusive groups, to let them be resolved
	const exclusiveGroupMap = new Map<string, string>()
	for (const layer of showStyle.sourceLayers) {
		if (layer.exclusiveGroup) {
			exclusiveGroupMap.set(layer._id, layer.exclusiveGroup)
		}
	}

	const groupedPieces = _.groupBy(
		pieces,
		(p) => exclusiveGroupMap.get(p.piece.sourceLayerId) || p.piece.sourceLayerId
	)
	for (const pieces of Object.values(groupedPieces)) {
		// Group and sort the pieces so that we can step through each point in time
		const piecesByStart: Array<[number | 'now', PieceInstance[]]> = _.sortBy(
			Object.entries(_.groupBy(pieces, (p) => p.piece.enable.start)).map(([k, v]) =>
				literal<[number | 'now', PieceInstance[]]>([k === 'now' ? 'now' : Number(k), v])
			),
			([k]) => (k === 'now' ? nowInPart : k)
		)

		const isClear = (piece?: PieceInstance): boolean => !!(piece?.dynamicallyInserted && piece?.piece.virtual)

		// Step through time
		activePieces = {}
		for (const [start, pieces] of piecesByStart) {
			const newPieces = findPieceInstancesOnInfiniteLayers(pieces)

			// Handle any clears
			if (isClear(newPieces.onSegmentEnd) && activePieces.onSegmentEnd) {
				activePieces.onSegmentEnd.resolvedEndCap = start
				activePieces.onSegmentEnd = newPieces.onSegmentEnd = undefined
			}
			if (isClear(newPieces.onRundownEnd) && activePieces.onRundownEnd) {
				activePieces.onRundownEnd.resolvedEndCap = start
				activePieces.onRundownEnd = newPieces.onRundownEnd = undefined
			}

			// Apply the updates
			// Note: order is important, the higher layers must be done first
			updateWithNewPieces(newPieces, 'other', start)
			updateWithNewPieces(newPieces, 'onSegmentEnd', start)
			updateWithNewPieces(newPieces, 'onRundownEnd', start)
		}
	}

	return result
}

interface PieceInstanceOnInfiniteLayers {
	onRundownEnd?: PieceInstanceWithTimings
	onSegmentEnd?: PieceInstanceWithTimings
	other?: PieceInstanceWithTimings
}
function findPieceInstancesOnInfiniteLayers(pieces: PieceInstance[]): PieceInstanceOnInfiniteLayers {
	if (pieces.length === 0) {
		return {}
	}

	const res: PieceInstanceOnInfiniteLayers = {}

	const isCandidateBetter = (best: PieceInstance, candidate: PieceInstance): boolean => {
		if (best.infinite?.fromPrevious && !candidate.infinite?.fromPrevious) {
			// Prefer the candidate as it is not from previous
			return false
		}
		if (!best.infinite?.fromPrevious && candidate.infinite?.fromPrevious) {
			// Prefer the best as it is not from previous
			return true
		}

		// Fallback to id, as we dont have any other criteria and this will be stable.
		// Note: we shouldnt even get here, as it shouldnt be possible for multiple to start at the same time, but it is possible
		return best.piece._id < candidate.piece._id
	}

	for (const piece of pieces) {
		switch (piece.piece.lifespan) {
			case PieceLifespan.OutOnRundownEnd:
				if (!res.onRundownEnd || isCandidateBetter(res.onRundownEnd, piece)) {
					res.onRundownEnd = {
						...piece,
						priority: 1,
						// resolvedStart: piece.piece.enable.start,
					}
				}
				break
			case PieceLifespan.OutOnSegmentEnd:
				if (!res.onSegmentEnd || isCandidateBetter(res.onSegmentEnd, piece)) {
					res.onSegmentEnd = {
						...piece,
						priority: 2,
						// resolvedStart: piece.piece.enable.start,
					}
				}
				break
			case PieceLifespan.OutOnRundownChange:
			case PieceLifespan.OutOnSegmentChange:
			case PieceLifespan.WithinPart:
				if (!res.other || isCandidateBetter(res.other, piece)) {
					res.other = {
						...piece,
						priority: 5,
						// resolvedStart: piece.piece.enable.start,
					}
				}
				break
			default:
				assertNever(piece.piece.lifespan)
		}
	}

	return res
}
