import React, { useEffect, useMemo, useRef } from 'react'
import classNames from 'classnames'
import { unprotectString } from '@sofie-automation/corelib/dist/protectedString'
import { RundownUtils } from '../../lib/rundown'
import { AdLibListItem, IAdLibListItem } from './AdLibListItem'
import { AdLibPieceUi, AdlibSegmentUi } from './AdLibPanel'
import { RundownLayoutFilter, RundownLayoutFilterBase } from '../../../lib/collections/RundownLayouts'
import { ShowStyleBase } from '../../../lib/collections/ShowStyleBases'
import { Studio } from '../../../lib/collections/Studios'
import { RundownPlaylist } from '../../../lib/collections/RundownPlaylists'
import { BucketAdLibActionUi, BucketAdLibUi } from './RundownViewBuckets'
import { PieceUi } from '../SegmentContainer/withResolvedSegment'
import { IBlueprintActionTriggerMode } from '@sofie-automation/blueprints-integration'
import { getRandomString } from '@sofie-automation/corelib/dist/lib'

interface IListViewPropsHeader {
	uiSegments: Array<AdlibSegmentUi>
	onSelectAdLib?: (piece: IAdLibListItem) => void
	onToggleAdLib?: (piece: IAdLibListItem, queue: boolean, e: KeyboardEvent, mode?: IBlueprintActionTriggerMode) => void
	selectedPiece: BucketAdLibActionUi | BucketAdLibUi | IAdLibListItem | PieceUi | undefined
	selectedSegment: AdlibSegmentUi | undefined
	searchFilter: string | undefined
	showStyleBase: ShowStyleBase
	noSegments: boolean
	filter: RundownLayoutFilter | undefined
	rundownAdLibs?: Array<AdLibPieceUi>
	playlist: RundownPlaylist
	studio: Studio
}

/**
 * Applies a filter to an adLib to determine whether it matches filter criteria.
 * @param item AdLib to test against filter.
 * @param showStyleBase
 * @param uiSegments All segments to search for live segment.
 * @param filter Filter to match against.
 * @param searchFilter Text to try to match against adLib label.
 * @param uniquenessIds Set of uniquenessIds, for a given set only one adLib per uniquness Id will be matched by this filter.
 */
export function matchFilter(
	item: AdLibPieceUi,
	showStyleBase: ShowStyleBase,
	uiSegments: Array<AdlibSegmentUi>,
	filter?: RundownLayoutFilterBase,
	searchFilter?: string,
	uniquenessIds?: Set<string>
) {
	if (!searchFilter && !filter) return true
	const liveSegment = uiSegments.find((i) => i.isLive === true)
	const uppercaseLabel = item.name.toUpperCase()
	if (filter) {
		// Filter currentSegment only
		if (
			filter.currentSegment === true &&
			item.partId &&
			((liveSegment && liveSegment.parts.find((i) => item.partId === i.part._id) === undefined) || !liveSegment)
		) {
			return false
		}
		// Filter out items that are not within outputLayerIds filter
		if (
			filter.outputLayerIds !== undefined &&
			filter.outputLayerIds.length &&
			filter.outputLayerIds.indexOf(item.outputLayerId) < 0
		) {
			return false
		}
		// Source layers
		if (
			filter.sourceLayerIds !== undefined &&
			filter.sourceLayerIds.length &&
			filter.sourceLayerIds.indexOf(item.sourceLayerId) < 0
		) {
			return false
		}
		// Source layer types
		const sourceLayerType = showStyleBase.sourceLayers.find((i) => i._id === item.sourceLayerId)
		if (
			sourceLayerType &&
			filter.sourceLayerTypes !== undefined &&
			filter.sourceLayerTypes.length &&
			filter.sourceLayerTypes.indexOf(sourceLayerType.type) < 0
		) {
			return false
		}
		// Item label needs at least one of the strings in the label array
		if (
			filter.label !== undefined &&
			filter.label.length &&
			filter.label.reduce((p, v) => {
				return p || uppercaseLabel.indexOf(v.toUpperCase()) >= 0
			}, false) === false
		) {
			return false
		}
		// Item tags needs to contain all of the strings in the tags array
		if (
			filter.tags !== undefined &&
			filter.tags.length &&
			filter.tags.reduce((p, v) => {
				return p && item.tags !== undefined && item.tags.indexOf(v) >= 0
			}, true) === false
		) {
			return false
		}
		// Hide duplicates
		// Only the first adLib found with a given uniquenessId will be displayed if this option is enabled.
		// Scope of the filter is determined by the scope of the uniquenessIds set (typically rundown-wide).
		if (filter.hideDuplicates && uniquenessIds) {
			const uniquenessId = item.uniquenessId || unprotectString(item._id)
			if (uniquenessIds.has(uniquenessId)) {
				return false
			} else {
				uniquenessIds.add(uniquenessId)
			}
		}
	}
	if (searchFilter) {
		return uppercaseLabel.indexOf(searchFilter.trim().toUpperCase()) >= 0
	} else {
		return true
	}
}

export function matchTags(item: AdLibPieceUi, tags?: string[]) {
	if (
		tags !== undefined &&
		tags.reduce((p, v) => {
			return p && item.tags !== undefined && item.tags.indexOf(v) >= 0
		}, true) === false
	) {
		return false
	}
	return true
}

export function AdLibListView(props: IListViewPropsHeader) {
	const table = useRef<HTMLTableElement>(null)
	const instanceId = useRef(getRandomString())

	useEffect(() => {
		if (!table.current || !table.current.id || !props.selectedSegment) return
		// scroll to selected segment
		const segmentSelector = `#${table.current.id} .adlib-panel__list-view__item__${props.selectedSegment._id}`
		const segment: HTMLElement | null = document.querySelector(segmentSelector)
		if (!segment) return

		table.current.scrollTo({
			top: segment.offsetTop,
			behavior: 'smooth',
		})
	}, [props.selectedSegment, table.current])

	const { rundownAdLibs, rundownAdLibsUniqueIds } = useMemo(() => {
		const uniquenessIds0 = new Set<string>()
		return {
			rundownAdLibs: props.rundownAdLibs
				? props.rundownAdLibs.filter(
						(item) =>
							!item.isHidden &&
							matchFilter(item, props.showStyleBase, props.uiSegments, props.filter, props.searchFilter, uniquenessIds0)
				  )
				: ([] as AdLibPieceUi[]),
			rundownAdLibsUniqueIds: uniquenessIds0,
		}
	}, [props.rundownAdLibs, props.showStyleBase, props.filter, props.searchFilter])

	const filteredSegments = useMemo(
		() => props.uiSegments.filter((a) => (props.filter ? (props.filter.currentSegment ? a.isLive : true) : true)),
		[props.uiSegments, props.filter]
	)

	const filteredAdLibs = useMemo(() => {
		// this allows us to separate the memoization for Global AdLibs and AdLibs
		const uniquenessIds1 = new Set<string>(rundownAdLibsUniqueIds)

		const segmentMap: Record<string, AdLibPieceUi[]> = {}

		filteredSegments.forEach((segment) => {
			segmentMap[unprotectString(segment._id)] = segment.pieces.filter((item) =>
				matchFilter(item, props.showStyleBase, filteredSegments, props.filter, props.searchFilter, uniquenessIds1)
			)
		})

		return segmentMap
	}, [filteredSegments, props.showStyleBase, props.filter, props.searchFilter, rundownAdLibsUniqueIds])

	function renderAdLibListViewItem(adLibPiece: AdLibPieceUi) {
		return (
			<AdLibListItem
				key={unprotectString(adLibPiece._id)}
				piece={adLibPiece}
				layer={adLibPiece.sourceLayer}
				studio={props.studio}
				selected={
					(props.selectedPiece &&
						RundownUtils.isAdLibPiece(props.selectedPiece) &&
						props.selectedPiece._id === adLibPiece._id) ||
					false
				}
				disabled={adLibPiece.disabled ?? false}
				onToggleAdLib={props.onToggleAdLib}
				onSelectAdLib={props.onSelectAdLib}
				playlist={props.playlist}
			/>
		)
	}

	function renderRundownAdLibs() {
		if (!props.filter || (props.filter && props.filter.rundownBaseline === false)) return null
		return (
			<tbody className="adlib-panel__list-view__list__segment adlib-panel__list-view__item__rundown-baseline">
				{rundownAdLibs.map((adLibPiece: AdLibPieceUi) => renderAdLibListViewItem(adLibPiece))}
			</tbody>
		)
	}

	function renderSegments() {
		if (props.filter && props.filter.rundownBaseline === 'only') return null
		return filteredSegments.map((segment) => {
			if (segment.isHidden && segment.pieces.length === 0) return null
			return (
				<tbody
					key={unprotectString(segment._id)}
					className={classNames(
						'adlib-panel__list-view__list__segment',
						'adlib-panel__list-view__item__' + segment._id,
						{
							live: segment.isLive,
							next: segment.isNext && !segment.isLive,
							past:
								segment.parts.reduce((memo, item) => {
									return item.timings?.startedPlayback && item.timings?.duration ? memo : false
								}, true) === true,
						}
					)}
				>
					<tr className="adlib-panel__list-view__list__seg-header">
						<td colSpan={4}>{segment.name}</td>
					</tr>
					{filteredAdLibs[unprotectString(segment._id)].map((adLibPiece: AdLibPieceUi) =>
						renderAdLibListViewItem(adLibPiece)
					)}
				</tbody>
			)
		})
	}

	return (
		<div
			className={classNames('adlib-panel__list-view__list', {
				'adlib-panel__list-view__list--no-segments': props.noSegments,
			})}
		>
			<table
				id={'adlib-panel__list-view__table__' + instanceId.current}
				className="adlib-panel__list-view__list__table scroll-sink"
				ref={table}
			>
				{renderRundownAdLibs()}
				{renderSegments()}
			</table>
		</div>
	)
}