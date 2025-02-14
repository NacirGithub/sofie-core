import { Meteor } from 'meteor/meteor'
import { check } from '../../../lib/check'
import { PeripheralDevice, PeripheralDeviceId } from '../../../lib/collections/PeripheralDevices'
import { Rundowns } from '../../../lib/collections/Rundowns'
import { literal } from '../../../lib/lib'
import { IngestRundown, IngestSegment, IngestPart, IngestPlaylist } from '@sofie-automation/blueprints-integration'
import { logger } from '../../../lib/logging'
import { Segments } from '../../../lib/collections/Segments'
import { RundownIngestDataCache } from './ingestCache'
import { fetchStudioIdFromDevice, checkAccessAndGetPeripheralDevice, runIngestOperation } from './lib'
import { MethodContext } from '../../../lib/api/methods'
import { IngestJobs } from '@sofie-automation/corelib/dist/worker/ingest'

export namespace RundownInput {
	export async function dataPlaylistGet(
		context: MethodContext,
		deviceId: PeripheralDeviceId,
		deviceToken: string,
		playlistExternalId: string
	): Promise<IngestPlaylist> {
		const peripheralDevice = checkAccessAndGetPeripheralDevice(deviceId, deviceToken, context)
		logger.info('dataPlaylistGet', playlistExternalId)
		check(playlistExternalId, String)
		return getIngestPlaylist(peripheralDevice, playlistExternalId)
	}
	// Get info on the current rundowns from this device:
	export async function dataRundownList(
		context: MethodContext,
		deviceId: PeripheralDeviceId,
		deviceToken: string
	): Promise<string[]> {
		const peripheralDevice = checkAccessAndGetPeripheralDevice(deviceId, deviceToken, context)
		logger.info('dataRundownList')
		return listIngestRundowns(peripheralDevice)
	}
	export async function dataRundownGet(
		context: MethodContext,
		deviceId: PeripheralDeviceId,
		deviceToken: string,
		rundownExternalId: string
	): Promise<IngestRundown> {
		const peripheralDevice = checkAccessAndGetPeripheralDevice(deviceId, deviceToken, context)
		logger.info('dataRundownGet', rundownExternalId)
		check(rundownExternalId, String)
		return getIngestRundown(peripheralDevice, rundownExternalId)
	}
	// Delete, Create & Update Rundown (and it's contents):
	export async function dataRundownDelete(
		context: MethodContext,
		deviceId: PeripheralDeviceId,
		deviceToken: string,
		rundownExternalId: string
	): Promise<void> {
		const peripheralDevice = checkAccessAndGetPeripheralDevice(deviceId, deviceToken, context)
		const studioId = fetchStudioIdFromDevice(peripheralDevice)
		logger.info('dataRundownDelete', rundownExternalId)
		check(rundownExternalId, String)

		await runIngestOperation(studioId, IngestJobs.RemoveRundown, {
			rundownExternalId,
			peripheralDeviceId: peripheralDevice._id,
		})
	}
	export async function dataRundownCreate(
		context: MethodContext,
		deviceId: PeripheralDeviceId,
		deviceToken: string,
		ingestRundown: IngestRundown
	): Promise<void> {
		const peripheralDevice = checkAccessAndGetPeripheralDevice(deviceId, deviceToken, context)
		const studioId = fetchStudioIdFromDevice(peripheralDevice)
		logger.info('dataRundownCreate', ingestRundown)
		check(ingestRundown, Object)

		await runIngestOperation(studioId, IngestJobs.UpdateRundown, {
			rundownExternalId: ingestRundown.externalId,
			peripheralDeviceId: peripheralDevice._id,
			ingestRundown: ingestRundown,
			isCreateAction: true,
		})
	}
	export async function dataRundownUpdate(
		context: MethodContext,
		deviceId: PeripheralDeviceId,
		deviceToken: string,
		ingestRundown: IngestRundown
	): Promise<void> {
		const peripheralDevice = checkAccessAndGetPeripheralDevice(deviceId, deviceToken, context)
		const studioId = fetchStudioIdFromDevice(peripheralDevice)
		logger.info('dataRundownUpdate', ingestRundown)
		check(ingestRundown, Object)

		await runIngestOperation(studioId, IngestJobs.UpdateRundown, {
			rundownExternalId: ingestRundown.externalId,
			peripheralDeviceId: peripheralDevice._id,
			ingestRundown: ingestRundown,
			isCreateAction: false,
		})
	}
	export async function dataRundownMetaDataUpdate(
		context: MethodContext,
		deviceId: PeripheralDeviceId,
		deviceToken: string,
		ingestRundown: Omit<IngestRundown, 'segments'>
	): Promise<void> {
		const peripheralDevice = checkAccessAndGetPeripheralDevice(deviceId, deviceToken, context)
		const studioId = fetchStudioIdFromDevice(peripheralDevice)
		logger.info('dataRundownMetaDataUpdate', ingestRundown)
		check(ingestRundown, Object)

		await runIngestOperation(studioId, IngestJobs.UpdateRundownMetaData, {
			rundownExternalId: ingestRundown.externalId,
			peripheralDeviceId: peripheralDevice._id,
			ingestRundown: ingestRundown,
		})
	}
	export async function dataSegmentGet(
		context: MethodContext,
		deviceId: PeripheralDeviceId,
		deviceToken: string,
		rundownExternalId: string,
		segmentExternalId: string
	): Promise<IngestSegment> {
		const peripheralDevice = checkAccessAndGetPeripheralDevice(deviceId, deviceToken, context)
		logger.info('dataSegmentGet', rundownExternalId, segmentExternalId)
		check(rundownExternalId, String)
		check(segmentExternalId, String)
		return getIngestSegment(peripheralDevice, rundownExternalId, segmentExternalId)
	}
	// Delete, Create & Update Segment (and it's contents):
	export async function dataSegmentDelete(
		context: MethodContext,
		deviceId: PeripheralDeviceId,
		deviceToken: string,
		rundownExternalId: string,
		segmentExternalId: string
	): Promise<void> {
		const peripheralDevice = checkAccessAndGetPeripheralDevice(deviceId, deviceToken, context)
		const studioId = fetchStudioIdFromDevice(peripheralDevice)
		logger.info('dataSegmentDelete', rundownExternalId, segmentExternalId)
		check(rundownExternalId, String)
		check(segmentExternalId, String)

		await runIngestOperation(studioId, IngestJobs.RemoveSegment, {
			rundownExternalId,
			peripheralDeviceId: peripheralDevice._id,
			segmentExternalId,
		})
	}
	export async function dataSegmentCreate(
		context: MethodContext,
		deviceId: PeripheralDeviceId,
		deviceToken: string,
		rundownExternalId: string,
		ingestSegment: IngestSegment
	): Promise<void> {
		const peripheralDevice = checkAccessAndGetPeripheralDevice(deviceId, deviceToken, context)
		const studioId = fetchStudioIdFromDevice(peripheralDevice)
		logger.info('dataSegmentCreate', rundownExternalId, ingestSegment)
		check(rundownExternalId, String)
		check(ingestSegment, Object)

		await runIngestOperation(studioId, IngestJobs.UpdateSegment, {
			rundownExternalId,
			peripheralDeviceId: peripheralDevice._id,
			ingestSegment,
			isCreateAction: true,
		})
	}
	export async function dataSegmentUpdate(
		context: MethodContext,
		deviceId: PeripheralDeviceId,
		deviceToken: string,
		rundownExternalId: string,
		ingestSegment: IngestSegment
	): Promise<void> {
		const peripheralDevice = checkAccessAndGetPeripheralDevice(deviceId, deviceToken, context)
		const studioId = fetchStudioIdFromDevice(peripheralDevice)
		logger.info('dataSegmentUpdate', rundownExternalId, ingestSegment)
		check(rundownExternalId, String)
		check(ingestSegment, Object)

		await runIngestOperation(studioId, IngestJobs.UpdateSegment, {
			rundownExternalId,
			peripheralDeviceId: peripheralDevice._id,
			ingestSegment,
			isCreateAction: false,
		})
	}
	export async function dataSegmentRanksUpdate(
		context: MethodContext,
		deviceId: PeripheralDeviceId,
		deviceToken: string,
		rundownExternalId: string,
		newRanks: { [segmentExternalId: string]: number }
	): Promise<void> {
		const peripheralDevice = checkAccessAndGetPeripheralDevice(deviceId, deviceToken, context)
		const studioId = fetchStudioIdFromDevice(peripheralDevice)
		logger.info('dataSegmentRanksUpdate', rundownExternalId, Object.keys(newRanks))
		check(rundownExternalId, String)
		check(newRanks, Object)

		await runIngestOperation(studioId, IngestJobs.UpdateSegmentRanks, {
			rundownExternalId,
			peripheralDeviceId: peripheralDevice._id,
			newRanks,
		})
	}
	// Delete, Create & Update Part:
	export async function dataPartDelete(
		context: MethodContext,
		deviceId: PeripheralDeviceId,
		deviceToken: string,
		rundownExternalId: string,
		segmentExternalId: string,
		partExternalId: string
	): Promise<void> {
		const peripheralDevice = checkAccessAndGetPeripheralDevice(deviceId, deviceToken, context)
		const studioId = fetchStudioIdFromDevice(peripheralDevice)
		logger.info('dataPartDelete', rundownExternalId, segmentExternalId, partExternalId)
		check(rundownExternalId, String)
		check(segmentExternalId, String)
		check(partExternalId, String)

		await runIngestOperation(studioId, IngestJobs.RemovePart, {
			rundownExternalId,
			peripheralDeviceId: peripheralDevice._id,
			segmentExternalId,
			partExternalId,
		})
	}
	export async function dataPartCreate(
		context: MethodContext,
		deviceId: PeripheralDeviceId,
		deviceToken: string,
		rundownExternalId: string,
		segmentExternalId: string,
		ingestPart: IngestPart
	): Promise<void> {
		const peripheralDevice = checkAccessAndGetPeripheralDevice(deviceId, deviceToken, context)
		const studioId = fetchStudioIdFromDevice(peripheralDevice)
		logger.info('dataPartCreate', rundownExternalId, segmentExternalId, ingestPart)
		check(rundownExternalId, String)
		check(segmentExternalId, String)
		check(ingestPart, Object)

		await runIngestOperation(studioId, IngestJobs.UpdatePart, {
			rundownExternalId,
			peripheralDeviceId: peripheralDevice._id,
			segmentExternalId,
			ingestPart,
			isCreateAction: true,
		})
	}
	export async function dataPartUpdate(
		context: MethodContext,
		deviceId: PeripheralDeviceId,
		deviceToken: string,
		rundownExternalId: string,
		segmentExternalId: string,
		ingestPart: IngestPart
	): Promise<void> {
		const peripheralDevice = checkAccessAndGetPeripheralDevice(deviceId, deviceToken, context)
		const studioId = fetchStudioIdFromDevice(peripheralDevice)
		logger.info('dataPartUpdate', rundownExternalId, segmentExternalId, ingestPart)
		check(rundownExternalId, String)
		check(segmentExternalId, String)
		check(ingestPart, Object)

		await runIngestOperation(studioId, IngestJobs.UpdatePart, {
			rundownExternalId,
			peripheralDeviceId: peripheralDevice._id,
			segmentExternalId,
			ingestPart,
			isCreateAction: false,
		})
	}
}

async function getIngestPlaylist(
	peripheralDevice: PeripheralDevice,
	playlistExternalId: string
): Promise<IngestPlaylist> {
	const rundowns = await Rundowns.findFetchAsync({
		peripheralDeviceId: peripheralDevice._id,
		playlistExternalId,
	})

	const ingestPlaylist: IngestPlaylist = literal<IngestPlaylist>({
		externalId: playlistExternalId,
		rundowns: [],
	})

	await Promise.all(
		rundowns.map(async (rundown) => {
			const ingestCache = await RundownIngestDataCache.create(rundown._id)
			const ingestData = ingestCache.fetchRundown()
			if (ingestData) {
				ingestPlaylist.rundowns.push(ingestData)
			}
		})
	)

	return ingestPlaylist
}
async function getIngestRundown(peripheralDevice: PeripheralDevice, rundownExternalId: string): Promise<IngestRundown> {
	const rundown = await Rundowns.findOneAsync({
		peripheralDeviceId: peripheralDevice._id,
		externalId: rundownExternalId,
	})
	if (!rundown) {
		throw new Meteor.Error(404, `Rundown "${rundownExternalId}" not found`)
	}

	const ingestCache = await RundownIngestDataCache.create(rundown._id)
	const ingestData = ingestCache.fetchRundown()
	if (!ingestData)
		throw new Meteor.Error(404, `Rundown "${rundown._id}", (${rundownExternalId}) has no cached ingest data`)
	return ingestData
}
async function getIngestSegment(
	peripheralDevice: PeripheralDevice,
	rundownExternalId: string,
	segmentExternalId: string
): Promise<IngestSegment> {
	const rundown = await Rundowns.findOneAsync({
		peripheralDeviceId: peripheralDevice._id,
		externalId: rundownExternalId,
	})
	if (!rundown) {
		throw new Meteor.Error(404, `Rundown "${rundownExternalId}" not found`)
	}

	const segment = await Segments.findOneAsync({
		externalId: segmentExternalId,
		rundownId: rundown._id,
	})

	if (!segment) {
		throw new Meteor.Error(404, `Segment ${segmentExternalId} not found in rundown ${rundownExternalId}`)
	}

	const ingestCache = await RundownIngestDataCache.create(rundown._id)
	const ingestData = ingestCache.fetchSegment(segment._id)
	if (!ingestData)
		throw new Meteor.Error(
			404,
			`Rundown "${rundown._id}", (${rundownExternalId}) has no cached segment "${segment._id}" ingest data`
		)
	return ingestData
}
async function listIngestRundowns(peripheralDevice: PeripheralDevice): Promise<string[]> {
	const rundowns = await Rundowns.findFetchAsync({
		peripheralDeviceId: peripheralDevice._id,
	})

	return rundowns.map((r) => r.externalId)
}
