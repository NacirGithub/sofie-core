import * as _ from 'underscore'
import * as SuperTimeline from 'superfly-timeline'
import { SegmentLineItems, SegmentLineItem } from './collections/SegmentLineItems'
import { SegmentLineItemLifespan, getSliGroupId } from 'tv-automation-sofie-blueprints-integration'
import { normalizeArray, extendMandadory } from './lib'
import { Segment } from './collections/Segments'
import { SegmentLine, SegmentLines } from './collections/SegmentLines'
import { RunningOrder } from './collections/RunningOrders'
import { ShowStyleBase } from './collections/ShowStyleBases'
import { IOutputLayer, ISourceLayer } from 'tv-automation-sofie-blueprints-integration'

export const DEFAULT_DISPLAY_DURATION = 3000

export interface SegmentExtended extends Segment {
	/** Output layers available in the installation used by this segment */
	outputLayers: {
		[key: string]: IOutputLayerExtended
	}
	/** Source layers used by this segment */
	sourceLayers: {
		[key: string]: ISourceLayerExtended
	}
}

export interface SegmentLineExtended extends SegmentLine {
	/** Segment line items belonging to this segment line */
	items: Array<SegmentLineItemExtended>
	renderedDuration: number
	startsAt: number
	willProbablyAutoNext: boolean
}

export interface IOutputLayerExtended extends IOutputLayer {
	/** Is this output layer used in this segment */
	used: boolean
	/** Source layers that will be used by this output layer */
	sourceLayers: Array<ISourceLayerExtended>,
}
export interface ISourceLayerExtended extends ISourceLayer {
	/** Segment line items present on this source layer */
	items: Array<SegmentLineItemExtended>
	followingItems: Array<SegmentLineItemExtended>
}
interface ISegmentLineItemExtendedDictionary {
	[key: string]: SegmentLineItemExtended
}
export interface SegmentLineItemExtended extends SegmentLineItem {
	/** Source layer that this segment line item belongs to */
	sourceLayer?: ISourceLayerExtended
	/** Output layer that this segment line uses */
	outputLayer?: IOutputLayerExtended
	/** Position in timeline, relative to the beginning of the segment */
	renderedInPoint: number | null
	/** Duration in timeline */
	renderedDuration: number | null
	/** If set, the item was cropped in runtime by another item following it */
	cropped?: boolean
	/** This item is being continued by another, linked, item in another SegmentLine */
	continuedByRef?: SegmentLineItemExtended
	/** This item is continuing another, linked, item in another SegmentLine */
	continuesRef?: SegmentLineItemExtended
	/** Maximum width of a label so as not to appear underneath the following item */
	maxLabelWidth?: number
}

export function getResolvedSegment (showStyleBase: ShowStyleBase, runningOrder: RunningOrder, segment: Segment, checkFollowingSegment?: boolean): {
	segmentExtended: SegmentExtended,
	segmentLines: Array<SegmentLineExtended>,
	isLiveSegment: boolean,
	isNextSegment: boolean,
	currentLiveSegmentLine: SegmentLineExtended | undefined,
	hasRemoteItems: boolean,
	hasGuestItems: boolean,
	hasAlreadyPlayed: boolean,
	autoNextSegmentLine: boolean
	followingSegmentLine: SegmentLineExtended | undefined
} {

	let isLiveSegment = false
	let isNextSegment = false
	let currentLiveSegmentLine: SegmentLineExtended | undefined = undefined
	let nextSegmentLine: SegmentLineExtended | undefined = undefined
	let hasAlreadyPlayed = false
	let hasRemoteItems = false
	let hasGuestItems = false
	let followingSegmentLine: SegmentLineExtended | undefined = undefined

	let autoNextSegmentLine = false

	let segmentExtended = _.clone(segment) as SegmentExtended
	segmentExtended.outputLayers = {}
	segmentExtended.sourceLayers = {}

	// fetch all the segment lines for the segment
	let segmentLinesE: Array<SegmentLineExtended> = []
	let segmentLines = segment.getSegmentLines()

	if (segmentLines.length > 0) {
		if (checkFollowingSegment) {
			let followingSLines = SegmentLines.find({
				runningOrderId: segment.runningOrderId,
				_rank: {
					$gt: segmentLines[segmentLines.length - 1]._rank
				}
			}, { sort: { _rank: 1 }, limit: 1 }).fetch()
			if (followingSLines.length > 0) {
				let followingSLine = followingSLines[0]

				let segmentLineItems = SegmentLineItems.find({
					segmentLineId: followingSLine._id
				}).fetch()

				followingSegmentLine = extendMandadory<SegmentLine, SegmentLineExtended>(followingSLine, {
					items: _.map(segmentLineItems, (sli) => {
						return extendMandadory<SegmentLineItem, SegmentLineItemExtended>(sli, {
							// sourceLayer: ISourceLayerExtended,
							// outputLayer: IOutputLayerExtended,
							renderedInPoint: null,
							renderedDuration: null,
							// cropped: false,
							// continuedByRef: SegmentLineItemExtended,
							// continuesRef: SegmentLineItemExtended,
							// maxLabelWidth: 0
						})
					}),
					renderedDuration: 0, // ?
					startsAt: 0, // ?
					willProbablyAutoNext: false // ?
				})
			}
		}

		// create local deep copies of the studioInstallation outputLayers and sourceLayers so that we can store
		// items present on those layers inside and also figure out which layers are used when inside the rundown
		const outputLayers = normalizeArray<IOutputLayerExtended>(
			showStyleBase.outputLayers.map((layer) => {
				return extendMandadory<IOutputLayer, IOutputLayerExtended>(
					_.clone(layer),
					{
						sourceLayers: [],
						used: false
					}
				)
			}),
			'_id')
		const sourceLayers = normalizeArray<ISourceLayerExtended>(
			showStyleBase.sourceLayers.map((layer) => {
				return extendMandadory<ISourceLayer, ISourceLayerExtended>(
					_.clone(layer),
					{
						followingItems: [],
						items: []
					}
				)
			}),
			'_id')

		const TIMELINE_TEMP_OFFSET = 1

		// ensure that the sourceLayers array in the segment outputLayers is created
		// _.each(outputLayers, (outputLayer) => {
		// 	if (_.isArray(outputLayer.sourceLayers)) {
		// 		outputLayer.sourceLayers.length = 0
		// 	} else {
		// 		outputLayer.sourceLayers = new Array<ISourceLayer>()
		// 	}
		// 	// reset the used property, in case the output layer lost all of its contents
		// 	outputLayer.used = false
		// })
		//
		// ensure that the items array is created
		// _.each(sourceLayers, (sourceLayer) => {
		// 	if (_.isArray(sourceLayer.items)) {
		// 		sourceLayer.items.length = 0
		// 	} else {
		// 		sourceLayer.items = new Array<SegmentLineItem>()
		// 	}
		// })

		let segmentLineItemsLookup: ISegmentLineItemExtendedDictionary = {}

		let startsAt = 0
		let previousSegmentLine: SegmentLineExtended
		// fetch all the segment line items for the segment lines
		segmentLinesE = _.map(segmentLines, (segmentLine) => {
			let slTimeline: SuperTimeline.UnresolvedTimeline = []

			let segmentLineE: SegmentLineExtended = extendMandadory(segmentLine, {
				items: _.map(SegmentLineItems.find({ segmentLineId: segmentLine._id }).fetch(), (sli) => {
					return extendMandadory<SegmentLineItem, SegmentLineItemExtended>(sli, {
						renderedDuration: 0,
						renderedInPoint: 0
					})
				}),
				renderedDuration: 0,
				startsAt: 0,
				willProbablyAutoNext: (
						(previousSegmentLine || {}).autoNext || false
					) && (
						(previousSegmentLine || {}).expectedDuration !== 0
					)
			})

			if (runningOrder.currentSegmentLineId === segmentLineE._id) {
				isLiveSegment = true
				currentLiveSegmentLine = segmentLineE
			}
			if (runningOrder.nextSegmentLineId === segmentLineE._id) {
				isNextSegment = true
				// next is only auto, if current has a duration
				nextSegmentLine = segmentLineE
			}
			autoNextSegmentLine = (
				currentLiveSegmentLine ?
				currentLiveSegmentLine.autoNext || false : false
			) && (
				(
					currentLiveSegmentLine &&
					currentLiveSegmentLine.expectedDuration !== undefined
				) ?
				currentLiveSegmentLine.expectedDuration !== 0 :
				false
			)

			if (segmentLineE.startedPlayback !== undefined) {
				hasAlreadyPlayed = true
			}

			_.each<SegmentLineItemExtended>(segmentLineE.items, (segmentLineItem) => {
				slTimeline.push({
					id: getSliGroupId(segmentLineItem),
					trigger: offsetTrigger(segmentLineItem.trigger, TIMELINE_TEMP_OFFSET),
					duration: segmentLineItem.durationOverride || segmentLineItem.duration || segmentLineItem.expectedDuration || 0,
					LLayer: segmentLineItem.outputLayerId,
					content: {
						id: segmentLineItem._id
					}
				})
				let outputLayer = outputLayers[segmentLineItem.outputLayerId] as IOutputLayerExtended | undefined
				segmentLineItem.outputLayer = outputLayer

				if (!segmentLineItem.virtual && outputLayer) {
					// mark the output layer as used within this segment
					// console.log(segmentLineItem)
					if (sourceLayers[segmentLineItem.sourceLayerId] && !sourceLayers[segmentLineItem.sourceLayerId].isHidden) {
						outputLayer.used = true
					}
					// attach the sourceLayer to the outputLayer, if it hasn't been already

					// find matching layer in the output layer
					let sourceLayer = outputLayer.sourceLayers.find((el) => {
						return el._id === segmentLineItem.sourceLayerId
					})

					if (!sourceLayer) {
						sourceLayer = sourceLayers[segmentLineItem.sourceLayerId]
						if (sourceLayer) {
							sourceLayer = _.clone(sourceLayer)
							let sl = sourceLayer as ISourceLayerExtended
							sl.items = []
							outputLayer.sourceLayers.push(sl)
						}
					}

					if (sourceLayer) {
						segmentLineItem.sourceLayer = sourceLayer
						// attach the segmentLineItem to the sourceLayer in this segment
						segmentLineItem.sourceLayer.items.push(segmentLineItem)

						// check if the segment should be in a special state for segments with remote input
						if (segmentLineItem.sourceLayer.isRemoteInput) {
							hasRemoteItems = true
						}

						if (segmentLineItem.sourceLayer.isGuestInput) {
							hasGuestItems = true
						}
					}
				}

				segmentLineItemsLookup[segmentLineItem._id] = segmentLineItem
				if (segmentLineItem.continuesRefId && segmentLineItemsLookup[segmentLineItem.continuesRefId]) {
					segmentLineItemsLookup[segmentLineItem.continuesRefId].continuedByRef = segmentLineItem
					segmentLineItem.continuesRef = segmentLineItemsLookup[segmentLineItem.continuesRefId]
				}
			})

			// SuperTimeline.Resolver.setTraceLevel(SuperTimeline.TraceLevel.TRACE)

			let slRTimeline = SuperTimeline.Resolver.getTimelineInWindow(slTimeline)
			let furthestDuration = 0
			slRTimeline.resolved.forEach((tlItem) => {
				let segmentLineItem = segmentLineItemsLookup[tlItem.content.id] // Timeline actually has copies of the content object, instead of the object itself
				segmentLineItem.renderedDuration = tlItem.resolved.outerDuration || null

				// if there is no renderedInPoint, use 0 as the starting time for the item
				segmentLineItem.renderedInPoint = tlItem.resolved.startTime ? tlItem.resolved.startTime - TIMELINE_TEMP_OFFSET : 0
				// console.log(segmentLineItem._id + ': ' + segmentLineItem.renderedInPoint)

				if (Number.isFinite(segmentLineItem.renderedDuration || 0) && ((segmentLineItem.renderedInPoint || 0) + (segmentLineItem.renderedDuration || 0) > furthestDuration)) {
					furthestDuration = (segmentLineItem.renderedInPoint || 0) + (segmentLineItem.renderedDuration || 0)
				}
			})

			segmentLineE.renderedDuration = segmentLineE.expectedDuration || DEFAULT_DISPLAY_DURATION // furthestDuration
			segmentLineE.startsAt = startsAt
			startsAt = segmentLineE.startsAt + (segmentLineE.renderedDuration || 0)

			previousSegmentLine = segmentLineE
			return segmentLineE
		})

		const resolveDuration = (item: SegmentLineItemExtended): number => {
			let childDuration = 0
			/* if (item.continuedByRef) {
				childDuration = resolveDuration(item.continuedByRef)
				item.continuedByRef.linked = true
			} */
			const expectedDurationNumber = (typeof item.expectedDuration === 'number' ? item.expectedDuration || 0 : 0)
			return (item.durationOverride || item.duration || item.renderedDuration || expectedDurationNumber) + childDuration
		}

		_.each<SegmentLineExtended>(segmentLinesE, (segmentLine) => {
			if (segmentLine.items) {
				_.each<SegmentLineItemExtended>(segmentLine.items, (item) => {
					if (item.continuedByRef) {
						item.renderedDuration = resolveDuration(item)
					}
				})

				const itemsByLayer = _.groupBy(segmentLine.items, (item) => {
					return item.outputLayerId + '_' + item.sourceLayerId
				})
				_.each(itemsByLayer, (layerItems, outputSourceCombination) => {
					const sortedItems = _.sortBy(layerItems, 'renderedInPoint')
					for (let i = 1; i < sortedItems.length; i++) {
						const currentItem = sortedItems[i] as SegmentLineItemExtended
						const previousItem = sortedItems[i - 1] as SegmentLineItemExtended
						if (previousItem.renderedInPoint !== null && currentItem.renderedInPoint !== null && previousItem.renderedDuration !== null && currentItem.renderedDuration !== null &&
							previousItem.renderedInPoint !== undefined && currentItem.renderedInPoint !== undefined && previousItem.renderedDuration !== undefined && currentItem.renderedDuration !== undefined) {
							if ((previousItem.renderedInPoint + previousItem.renderedDuration > currentItem.renderedInPoint) ||
							 (previousItem.infiniteMode)
								) {
								previousItem.renderedDuration = currentItem.renderedInPoint - previousItem.renderedInPoint
								previousItem.cropped = true
								if (previousItem.infiniteMode) {
									previousItem.infiniteMode = SegmentLineItemLifespan.Normal
								}
							}

							previousItem.maxLabelWidth = currentItem.renderedInPoint - previousItem.renderedInPoint
						}
					}
				})
			}
		})

		if (followingSegmentLine && followingSegmentLine.items) {
			_.each<SegmentLineItemExtended>(followingSegmentLine.items, (segmentLineItem) => {
				// match output layers in following segment line, but do not mark as used
				// we only care about output layers used in this segment.
				let outputLayer = outputLayers[segmentLineItem.outputLayerId] as IOutputLayerExtended | undefined
				segmentLineItem.outputLayer = outputLayer

				// find matching layer in the output layer
				let sourceLayer = outputLayer && outputLayer.sourceLayers && outputLayer.sourceLayers.find((el) => {
					return el._id === segmentLineItem.sourceLayerId
				})

				if (sourceLayer === undefined) {
					if (outputLayer) {
						sourceLayer = sourceLayers[segmentLineItem.sourceLayerId]
						if (sourceLayer) {
							sourceLayer = _.clone(sourceLayer)
							let sl = sourceLayer as ISourceLayerExtended
							sl.items = []
							outputLayer.sourceLayers.push(sl)
						}
					}
				} else {
					segmentLineItem.sourceLayer = sourceLayer
					if (segmentLineItem.sourceLayer.followingItems === undefined) {
						segmentLineItem.sourceLayer.followingItems = []
					}
					// attach the segmentLineItem to the sourceLayer in this segment
					segmentLineItem.sourceLayer.followingItems.push(segmentLineItem)
				}
			})
		}

		segmentExtended.outputLayers = outputLayers
		segmentExtended.sourceLayers = sourceLayers

		if (isNextSegment && !isLiveSegment && !autoNextSegmentLine && runningOrder.currentSegmentLineId) {
			const currentOtherSegmentLine = SegmentLines.findOne(runningOrder.currentSegmentLineId)
			if (currentOtherSegmentLine && currentOtherSegmentLine.expectedDuration && currentOtherSegmentLine.autoNext) {
				autoNextSegmentLine = true
			}
		}
	}
	return {
		segmentExtended,
		segmentLines: segmentLinesE,
		isLiveSegment,
		currentLiveSegmentLine,
		isNextSegment,
		hasAlreadyPlayed,
		hasGuestItems,
		hasRemoteItems,
		autoNextSegmentLine,
		followingSegmentLine
	}

	// get the segment line immediately after the last segment

}

function offsetTrigger (
	trigger: {
		type: SuperTimeline.TriggerType,
		value: string | number | null
	},
	offset
) {
	if (trigger.type !== SuperTimeline.TriggerType.TIME_ABSOLUTE) {
		return trigger
	} else {
		if (trigger.type === SuperTimeline.TriggerType.TIME_ABSOLUTE && trigger.value === 'now') {
			return _.extend({}, trigger, {
				// value: segmentLine.startedPlayback ? getCurrentTime() - segmentLine.startedPlayback : offset
				value: offset
			})
		} else {
			return _.extend({}, trigger, {
				value: trigger.value + offset
			})
		}
	}
}
