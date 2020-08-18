import { Meteor } from 'meteor/meteor'
import { check } from '../../lib/check'
import { meteorPublish, AutoFillSelector } from './lib'
import { PubSub } from '../../lib/api/pubsub'
import { Studios, DBStudio } from '../../lib/collections/Studios'
import { PeripheralDeviceId, PeripheralDevices } from '../../lib/collections/PeripheralDevices'
import { PeripheralDeviceReadAccess } from '../security/peripheralDevice'
import { ExternalMessageQueue, ExternalMessageQueueObj } from '../../lib/collections/ExternalMessageQueue'
import { RecordedFiles, RecordedFile } from '../../lib/collections/RecordedFiles'
import { MediaObjects } from '../../lib/collections/MediaObjects'
import { StudioReadAccess } from '../security/studio'
import { Timeline, TimelineObjGeneric } from '../../lib/collections/Timeline'
import { OrganizationReadAccess } from '../security/organization'
import { FindOptions } from '../../lib/typings/meteor'
import { NoSecurityReadAccess } from '../security/noSecurity'

meteorPublish(PubSub.studios, function(selector0, token) {
	const { cred, selector } = AutoFillSelector.organizationId(this.userId, selector0, token)
	const modifier: FindOptions<DBStudio> = {
		fields: {},
	}
	if (
		NoSecurityReadAccess.any() ||
		(selector._id && StudioReadAccess.studio(selector, cred)) ||
		(selector.organizationId && OrganizationReadAccess.organizationContent(selector, cred))
	) {
		return Studios.find(selector, modifier)
	}
	return null
})
meteorPublish(PubSub.studioOfDevice, function(deviceId: PeripheralDeviceId, token) {
	if (PeripheralDeviceReadAccess.peripheralDevice({ _id: deviceId }, { userId: this.userId, token })) {
		let peripheralDevice = PeripheralDevices.findOne(deviceId)

		if (!peripheralDevice) throw new Meteor.Error('PeripheralDevice "' + deviceId + '" not found')

		const modifier: FindOptions<DBStudio> = {
			fields: {},
		}
		let selector = {
			_id: peripheralDevice.studioId,
		}
		if (StudioReadAccess.studioContent(selector, { userId: this.userId, token })) {
			return Studios.find(selector, modifier)
		}
	}
	return null
})

meteorPublish(PubSub.externalMessageQueue, function(selector, token) {
	if (!selector) throw new Meteor.Error(400, 'selector argument missing')
	const modifier: FindOptions<ExternalMessageQueueObj> = {
		fields: {},
	}
	if (StudioReadAccess.studioContent(selector, { userId: this.userId, token })) {
		return ExternalMessageQueue.find(selector, modifier)
	}
	return null
})
meteorPublish(PubSub.recordedFiles, function(selector, token) {
	if (!selector) throw new Meteor.Error(400, 'selector argument missing')
	const modifier: FindOptions<RecordedFile> = {
		fields: {},
	}
	if (StudioReadAccess.studioContent(selector, { userId: this.userId, token })) {
		return RecordedFiles.find(selector, modifier)
	}
	return null
})

meteorPublish(PubSub.mediaObjects, function(studioId, selector, token) {
	if (!studioId) throw new Meteor.Error(400, 'studioId argument missing')
	selector = selector || {}
	check(studioId, String)
	check(selector, Object)
	const modifier: FindOptions<RecordedFile> = {
		fields: {},
	}
	selector.studioId = studioId
	if (StudioReadAccess.studioContent(selector, { userId: this.userId, token })) {
		return MediaObjects.find(selector, modifier)
	}
	return null
})
meteorPublish(PubSub.timeline, function(selector, token) {
	if (!selector) throw new Meteor.Error(400, 'selector argument missing')
	const modifier: FindOptions<TimelineObjGeneric> = {
		fields: {},
	}
	if (StudioReadAccess.studioContent(selector, { userId: this.userId, token })) {
		return Timeline.find(selector, modifier)
	}
	return null
})
