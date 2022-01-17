import { DBPartInstance } from '@sofie-automation/corelib/dist/dataModel/PartInstance'
import { CacheForPlayout } from '../playout/cache'
import { Time } from '@sofie-automation/blueprints-integration'
import { unprotectString } from '@sofie-automation/corelib/dist/protectedString'
import { ReadonlyDeep } from 'type-fest'
import { DBRundownPlaylist } from '@sofie-automation/corelib/dist/dataModel/RundownPlaylist'
import { PieceInstance } from '@sofie-automation/corelib/dist/dataModel/PieceInstance'
import { JobContext } from '../jobs'
import { PartInstanceId, RundownPlaylistId } from '@sofie-automation/corelib/dist/dataModel/Ids'
import { logger } from '../logging'
import * as debounceFn from 'debounce-fn'
import { EventsJobs } from '@sofie-automation/corelib/dist/worker/events'

const EVENT_WAIT_TIME = 500

const partInstanceTimingDebounceFunctions = new Map<string, debounceFn.DebouncedFunction<[], void>>()

function handlePartInstanceTimingEvent(
	context: JobContext,
	playlistId: RundownPlaylistId,
	partInstanceId: PartInstanceId
): void {
	// Future: this should be workqueue backed, not in-memory

	// wait EVENT_WAIT_TIME, because blueprint.onAsRunEvent() it is likely for there to be a bunch of started and stopped events coming in at the same time
	// These blueprint methods are not time critical (meaning they do raw db operations), and can be easily delayed
	const funcId = `${playlistId}_${partInstanceId}`
	const cachedFunc = partInstanceTimingDebounceFunctions.get(funcId)
	if (cachedFunc) {
		cachedFunc()
	} else {
		const newFunc = debounceFn(
			() => {
				context
					.queueEventJob(EventsJobs.PartInstanceTimings, {
						playlistId,
						partInstanceId,
					})
					.catch((e) => {
						let msg = `Failed to queue job in handlePartInstanceTimingEvent "${funcId}": "${e.toString()}"`
						if (e.stack) msg += '\n' + e.stack
						logger.error(msg)
					})
			},
			{
				before: false,
				after: true,
				wait: EVENT_WAIT_TIME,
			}
		)
		partInstanceTimingDebounceFunctions.set(funcId, newFunc)
		newFunc()
	}
}

export function reportPartInstanceHasStarted(
	context: JobContext,
	cache: CacheForPlayout,
	partInstance: DBPartInstance,
	timestamp: Time
): void {
	if (partInstance) {
		let timestampUpdated = false
		// If timings.startedPlayback has already been set, we shouldn't set it to another value:
		if (!partInstance.timings?.startedPlayback) {
			cache.PartInstances.update(partInstance._id, {
				$set: {
					isTaken: true,
					'timings.startedPlayback': timestamp,
				},
			})
			timestampUpdated = true

			// Unset stoppedPlayback if it is set:
			if (partInstance.timings?.stoppedPlayback) {
				cache.PartInstances.update(partInstance._id, { $unset: { 'timings.stoppedPlayback': 1 } })
			}
		}
		// Update the playlist:
		cache.Playlist.update((playlist) => {
			if (!playlist.rundownsStartedPlayback) {
				playlist.rundownsStartedPlayback = {}
			}

			// If the partInstance is "untimed", it will not update the playlist's startedPlayback and will not count time in the GUI:
			if (!partInstance.part.untimed) {
				const rundownId = unprotectString(partInstance.rundownId)
				if (!playlist.rundownsStartedPlayback[rundownId]) {
					playlist.rundownsStartedPlayback[rundownId] = timestamp
				}

				if (!playlist.startedPlayback) {
					playlist.startedPlayback = timestamp
				}
			}

			return playlist
		})

		if (timestampUpdated) {
			cache.deferAfterSave(() => {
				// Run in the background, we don't want to hold onto the lock to do this
				handlePartInstanceTimingEvent(context, cache.PlaylistId, partInstance._id)
			})
		}
	}
}
export async function reportPartInstanceHasStopped(
	context: JobContext,
	playlistId: RundownPlaylistId,
	partInstance: DBPartInstance,
	timestamp: Time
): Promise<void> {
	await context.directCollections.PartInstances.update(partInstance._id, {
		$set: {
			'timings.stoppedPlayback': timestamp,
		},
	})

	handlePartInstanceTimingEvent(context, playlistId, partInstance._id)
}

export async function reportPieceHasStarted(
	context: JobContext,
	playlist: ReadonlyDeep<DBRundownPlaylist>,
	pieceInstance: PieceInstance,
	timestamp: Time
): Promise<void> {
	await Promise.all([
		context.directCollections.PieceInstances.update(pieceInstance._id, {
			$set: {
				startedPlayback: timestamp,
				stoppedPlayback: 0,
			},
		}),

		// Update the copy in the next-part if there is one, so that the infinite has the same start after a take
		pieceInstance.infinite && playlist?.nextPartInstanceId
			? context.directCollections.PieceInstances.update(
					{
						partInstanceId: playlist.nextPartInstanceId,
						'infinite.infiniteInstanceId': pieceInstance.infinite.infiniteInstanceId,
					},
					{
						$set: {
							startedPlayback: timestamp,
							stoppedPlayback: 0,
						},
					}
			  )
			: null,
	])

	handlePartInstanceTimingEvent(context, playlist._id, pieceInstance.partInstanceId)
}
export async function reportPieceHasStopped(
	context: JobContext,
	playlist: ReadonlyDeep<DBRundownPlaylist>,
	pieceInstance: PieceInstance,
	timestamp: Time
): Promise<void> {
	await context.directCollections.PieceInstances.update(pieceInstance._id, {
		$set: {
			stoppedPlayback: timestamp,
		},
	})

	handlePartInstanceTimingEvent(context, playlist._id, pieceInstance.partInstanceId)
}