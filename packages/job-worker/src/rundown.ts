import { PartId, PartInstanceId, SegmentId } from '@sofie-automation/corelib/dist/dataModel/Ids'
import { DBPart } from '@sofie-automation/corelib/dist/dataModel/Part'
import { DBRundown } from '@sofie-automation/corelib/dist/dataModel/Rundown'
import { DBRundownPlaylist } from '@sofie-automation/corelib/dist/dataModel/RundownPlaylist'
import { normalizeArrayToMap } from '@sofie-automation/corelib/dist/lib'
import { unprotectString } from '@sofie-automation/corelib/dist/protectedString'
import { ReadonlyDeep } from 'type-fest'
import _ = require('underscore')
import { JobContext } from './jobs'
import { logger } from './logging'
import { CacheForPlayout } from './playout/cache'

/** Return true if the rundown is allowed to be moved out of that playlist */
export async function allowedToMoveRundownOutOfPlaylist(
	context: JobContext,
	playlist: ReadonlyDeep<DBRundownPlaylist>,
	rundown: ReadonlyDeep<DBRundown>
): Promise<boolean> {
	if (rundown.playlistId !== playlist._id)
		throw new Error(
			`Wrong playlist "${playlist._id}" provided for rundown "${rundown._id}" ("${rundown.playlistId}")`
		)

	const partInstanceIds = _.compact([playlist.currentPartInstanceId, playlist.nextPartInstanceId])
	if (!playlist.activationId || partInstanceIds.length === 0) return true

	const selectedPartInstancesInRundown = await context.directCollections.PartInstances.findFetch(
		{
			_id: { $in: partInstanceIds },
			rundownId: rundown._id,
		},
		{ projection: { _id: 1 } }
	)

	return selectedPartInstancesInRundown.length === 0
}

export type ChangedSegmentsRankInfo = Array<{
	segmentId: SegmentId
	oldPartIdsAndRanks: Array<{ id: PartId; rank: number }> | null // Null if the Parts havent changed, and so can be loaded locally
}>

/**
 * Update the ranks of all PartInstances in the given segments.
 * Syncs the ranks from matching Parts to PartInstances.
 * Orphaned PartInstances get ranks interpolated based on what they were ranked between before the ingest update
 */
export function updatePartInstanceRanks(cache: CacheForPlayout, changedSegments: ChangedSegmentsRankInfo): void {
	const groupedPartInstances = _.groupBy(
		cache.PartInstances.findFetch({
			reset: { $ne: true },
			segmentId: { $in: changedSegments.map((s) => s.segmentId) },
		}),
		(p) => unprotectString(p.segmentId)
	)
	const groupedNewParts = _.groupBy(
		cache.Parts.findFetch({
			segmentId: { $in: changedSegments.map((s) => s.segmentId) },
		}),
		(p) => unprotectString(p.segmentId)
	)

	let updatedParts = 0
	for (const { segmentId, oldPartIdsAndRanks: oldPartIdsAndRanks0 } of changedSegments) {
		const newParts = groupedNewParts[unprotectString(segmentId)] || []
		const segmentPartInstances = _.sortBy(
			groupedPartInstances[unprotectString(segmentId)] || [],
			(p) => p.part._rank
		)

		// Ensure the PartInstance ranks are synced with their Parts
		const newPartsMap = normalizeArrayToMap(newParts, '_id')
		for (const partInstance of segmentPartInstances) {
			const part = newPartsMap.get(partInstance.part._id)
			if (part) {
				// We have a part and instance, so make sure the part isn't orphaned and sync the rank
				cache.PartInstances.update(partInstance._id, {
					$set: {
						'part._rank': part._rank,
					},
					$unset: {
						orphaned: 1,
					},
				})

				// Update local copy
				delete partInstance.orphaned
				partInstance.part._rank = part._rank
			} else if (!partInstance.orphaned) {
				partInstance.orphaned = 'deleted'
				cache.PartInstances.update(partInstance._id, {
					$set: {
						orphaned: 'deleted',
					},
				})
			}
		}

		const orphanedPartInstances = segmentPartInstances
			.map((p) => ({ rank: p.part._rank, orphaned: p.orphaned, instanceId: p._id, id: p.part._id }))
			.filter((p) => p.orphaned)

		if (orphanedPartInstances.length === 0) {
			// No orphans to position
			continue
		}

		logger.debug(
			`updatePartInstanceRanks: ${segmentPartInstances.length} partInstances with ${orphanedPartInstances.length} orphans in segment "${segmentId}"`
		)

		// If we have no instances, or no parts to base it on, then we can't do anything
		if (newParts.length === 0) {
			// position them all 0..n
			let i = 0
			for (const partInfo of orphanedPartInstances) {
				cache.PartInstances.update(partInfo.instanceId, { $set: { 'part._rank': i++ } })
			}
			continue
		}

		const oldPartIdsAndRanks = oldPartIdsAndRanks0 ?? newParts.map((p) => ({ id: p._id, rank: p._rank }))

		const preservedPreviousParts = oldPartIdsAndRanks.filter((p) => newPartsMap.has(p.id))

		if (preservedPreviousParts.length === 0) {
			// position them all before the first
			const firstPartRank = newParts.length > 0 ? (_.min(newParts, (p) => p._rank) as DBPart)._rank : 0
			let i = firstPartRank - orphanedPartInstances.length
			for (const partInfo of orphanedPartInstances) {
				cache.PartInstances.update(partInfo.instanceId, { $set: { 'part._rank': i++ } })
			}
		} else {
			// they need interleaving

			// compile the old order, and get a list of the ones that still remain in the new state
			const allParts = new Map<PartId, { rank: number; id: PartId; instanceId?: PartInstanceId }>()
			for (const oldPart of oldPartIdsAndRanks) allParts.set(oldPart.id, oldPart)
			for (const orphanedPart of orphanedPartInstances) allParts.set(orphanedPart.id, orphanedPart)

			// Now go through and update their ranks
			const remainingPreviousParts = _.sortBy(Array.from(allParts.values()), (p) => p.rank).filter(
				(p) => p.instanceId || newPartsMap.has(p.id)
			)

			for (let i = -1; i < remainingPreviousParts.length - 1; ) {
				// Find the range to process this iteration
				const beforePartIndex = i
				const afterPartIndex = remainingPreviousParts.findIndex((p, o) => o > i && !p.instanceId)

				if (afterPartIndex === beforePartIndex + 1) {
					// no dynamic parts in between
					i++
					continue
				} else if (afterPartIndex === -1) {
					// We will reach the end, so make sure we stop
					i = remainingPreviousParts.length
				} else {
					// next iteration should look from the next fixed point
					i = afterPartIndex
				}

				const firstDynamicIndex = beforePartIndex + 1
				const lastDynamicIndex = afterPartIndex === -1 ? remainingPreviousParts.length - 1 : afterPartIndex - 1

				// Calculate the rank change per part
				const dynamicPartCount = lastDynamicIndex - firstDynamicIndex + 1
				const basePartRank =
					beforePartIndex === -1 ? -1 : newPartsMap.get(remainingPreviousParts[beforePartIndex].id)?._rank! // eslint-disable-line @typescript-eslint/no-non-null-asserted-optional-chain
				const afterPartRank =
					afterPartIndex === -1
						? basePartRank + 1
						: newPartsMap.get(remainingPreviousParts[afterPartIndex].id)?._rank! // eslint-disable-line @typescript-eslint/no-non-null-asserted-optional-chain
				const delta = (afterPartRank - basePartRank) / (dynamicPartCount + 1)

				let prevRank = basePartRank
				for (let o = firstDynamicIndex; o <= lastDynamicIndex; o++) {
					const newRank = (prevRank = prevRank + delta)

					const orphanedPart = remainingPreviousParts[o]
					if (orphanedPart.instanceId && orphanedPart.rank !== newRank) {
						cache.PartInstances.update(orphanedPart.instanceId, { $set: { 'part._rank': newRank } })
						updatedParts++
					}
				}
			}
		}
	}
	logger.debug(`updatePartRanks: ${updatedParts} PartInstances updated`)
}

// export namespace ClientRundownAPI {
// 	export function rundownPlaylistNeedsResync(context: MethodContext, playlistId: RundownPlaylistId): string[] {
// 		check(playlistId, String)
// 		const access = StudioContentWriteAccess.rundownPlaylist(context, playlistId)
// 		const playlist = access.playlist

// 		const rundowns = playlist.getRundowns()
// 		const errors = rundowns.map((rundown) => {
// 			if (!rundown.importVersions) return 'unknown'

// 			if (rundown.importVersions.core !== (PackageInfo.versionExtended || PackageInfo.version))
// 				return 'coreVersion'

// 			const showStyleVariant = ShowStyleVariants.findOne(rundown.showStyleVariantId)
// 			if (!showStyleVariant) return 'missing showStyleVariant'
// 			if (rundown.importVersions.showStyleVariant !== (showStyleVariant._rundownVersionHash || 0))
// 				return 'showStyleVariant'

// 			const showStyleBase = ShowStyleBases.findOne(rundown.showStyleBaseId)
// 			if (!showStyleBase) return 'missing showStyleBase'
// 			if (rundown.importVersions.showStyleBase !== (showStyleBase._rundownVersionHash || 0))
// 				return 'showStyleBase'

// 			const blueprint = Blueprints.findOne(showStyleBase.blueprintId)
// 			if (!blueprint) return 'missing blueprint'
// 			if (rundown.importVersions.blueprint !== (blueprint.blueprintVersion || 0)) return 'blueprint'

// 			const studio = Studios.findOne(rundown.studioId)
// 			if (!studio) return 'missing studio'
// 			if (rundown.importVersions.studio !== (studio._rundownVersionHash || 0)) return 'studio'
// 		})

// 		return _.compact(errors)
// 	}
// 	// Validate the blueprint config used for this rundown, to ensure that all the required fields are specified
// 	export async function rundownPlaylistValidateBlueprintConfig(
// 		context: MethodContext,
// 		playlistId: RundownPlaylistId
// 	): Promise<RundownPlaylistValidateBlueprintConfigResult> {
// 		check(playlistId, String)

// 		const access = StudioContentWriteAccess.rundownPlaylist(context, playlistId)
// 		const rundownPlaylist = access.playlist

// 		const studio = rundownPlaylist.getStudio()
// 		const studioBlueprint = studio.blueprintId ? await Blueprints.findOneAsync(studio.blueprintId) : null
// 		if (!studioBlueprint) throw new Meteor.Error(404, `Studio blueprint "${studio.blueprintId}" not found!`)

// 		const rundowns = rundownPlaylist.getRundowns()
// 		const uniqueShowStyleCompounds = _.uniq(
// 			rundowns,
// 			undefined,
// 			(rundown) => `${rundown.showStyleBaseId}-${rundown.showStyleVariantId}`
// 		)

// 		// Load all variants/compounds
// 		const [showStyleBases, showStyleVariants] = await Promise.all([
// 			ShowStyleBases.findFetchAsync({
// 				_id: { $in: uniqueShowStyleCompounds.map((r) => r.showStyleBaseId) },
// 			}),
// 			ShowStyleVariants.findFetchAsync({
// 				_id: { $in: uniqueShowStyleCompounds.map((r) => r.showStyleVariantId) },
// 			}),
// 		])
// 		const showStyleBlueprints = await Blueprints.findFetchAsync({
// 			_id: { $in: _.uniq(_.compact(showStyleBases.map((c) => c.blueprintId))) },
// 		})

// 		const showStyleBasesMap = normalizeArray(showStyleBases, '_id')
// 		const showStyleVariantsMap = normalizeArray(showStyleVariants, '_id')
// 		const showStyleBlueprintsMap = normalizeArray(showStyleBlueprints, '_id')

// 		const showStyleWarnings: RundownPlaylistValidateBlueprintConfigResult['showStyles'] =
// 			uniqueShowStyleCompounds.map((rundown) => {
// 				const showStyleBase = showStyleBasesMap[unprotectString(rundown.showStyleBaseId)]
// 				const showStyleVariant = showStyleVariantsMap[unprotectString(rundown.showStyleVariantId)]
// 				const id = `${rundown.showStyleBaseId}-${rundown.showStyleVariantId}`
// 				if (!showStyleBase || !showStyleVariant) {
// 					return {
// 						id: id,
// 						name: `${showStyleBase ? showStyleBase.name : rundown.showStyleBaseId}-${
// 							rundown.showStyleVariantId
// 						}`,
// 						checkFailed: true,
// 						fields: [],
// 					}
// 				}

// 				const compound = createShowStyleCompound(showStyleBase, showStyleVariant)
// 				if (!compound) {
// 					return {
// 						id: id,
// 						name: `${showStyleBase ? showStyleBase.name : rundown.showStyleBaseId}-${
// 							rundown.showStyleVariantId
// 						}`,
// 						checkFailed: true,
// 						fields: [],
// 					}
// 				}

// 				const blueprint = showStyleBlueprintsMap[unprotectString(compound.blueprintId)]
// 				if (!blueprint) {
// 					return {
// 						id: id,
// 						name: compound.name,
// 						checkFailed: true,
// 						fields: [],
// 					}
// 				} else {
// 					return {
// 						id: id,
// 						name: compound.name,
// 						checkFailed: false,
// 						fields: findMissingConfigs(blueprint.showStyleConfigManifest, compound.blueprintConfig),
// 					}
// 				}
// 			})

// 		return {
// 			studio: findMissingConfigs(studioBlueprint.studioConfigManifest, studio.blueprintConfig),
// 			showStyles: showStyleWarnings,
// 		}
// 	}
// }
