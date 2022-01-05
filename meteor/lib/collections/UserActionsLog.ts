import { Time, TimeDuration } from '../lib'
import { createMongoCollection } from './lib'
import { registerIndex } from '../database'
import { UserActionsLogItemId, OrganizationId, UserId } from '@sofie-automation/corelib/dist/dataModel/Ids'
import { CollectionName } from '@sofie-automation/corelib/dist/dataModel/Collections'
import { TimelineHash } from './Timeline'
export { UserActionsLogItemId }

export interface UserActionsLogItem {
	_id: UserActionsLogItemId

	organizationId: OrganizationId | null
	/** The user from which the action originated */
	userId: UserId | null
	/** The cliend address (IP-address) of the requester */
	clientAddress: string
	/** Timestamp for when the action was created (ie beginning of execution) */
	timestamp: Time
	method: string
	args: string
	context: string
	/** undefined=in progress, true=finished successfully, false=finished with error */
	success?: boolean
	errorMessage?: string
	doneTime?: Time

	/** The timelineHash that resulted from the userAction. Used to set .gatewayDuration. */
	timelineHash?: TimelineHash
	/** Timestamp of when the timeline was generated, used to calculate .gatewayDuration. */
	timelineGenerated?: number

	/** The time it took (within Core) to execute the action */
	executionTime?: TimeDuration
	/** The total time it took for playout-gateway(s) to receive and execute the timeline. */
	gatewayDuration?: TimeDuration[]
	/** The time playout-gateway(s) reported it took to resolve the timeline. */
	timelineResolveDuration?: TimeDuration[]
}

export const UserActionsLog = createMongoCollection<UserActionsLogItem>(CollectionName.UserActionsLog)

registerIndex(UserActionsLog, {
	organizationId: 1,
	timestamp: 1,
})
registerIndex(UserActionsLog, {
	timelineHash: 1,
})
