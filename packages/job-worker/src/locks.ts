import { assertNever, getRandomString } from '@sofie-automation/corelib/dist/lib'
import { logger } from './logging'
import { AnyLockEvent } from './workers/locks'
import { WorkerParentBase } from './workers/parent-base'

type OwnerAndLockIds = [string, string]

class LockResource {
	holder: OwnerAndLockIds | null = null
	waitingWorkers: Array<OwnerAndLockIds> = []

	constructor(readonly id: string) {}
}

type Unsub = () => void
export class LocksManager {
	readonly #resources = new Map<string, LockResource>()
	readonly #ids = new Map<string, WorkerParentBase>()
	readonly #subs = new Map<string, Unsub>()

	private getResource(resourceId: string): LockResource {
		let resource = this.#resources.get(resourceId)
		if (!resource) {
			resource = new LockResource(resourceId)
			this.#resources.set(resourceId, resource)
		}
		return resource
	}

	private lockNextWorker(resource: LockResource): void {
		logger.info(
			`Resource: ${resource.id} has holder "${resource.holder?.[0]}" and ${resource.waitingWorkers.length} waiting`
		)
		if (resource.holder === null) {
			const nextWorker = resource.waitingWorkers.shift()
			if (nextWorker) {
				const worker = this.#ids.get(nextWorker[0])
				if (!worker) {
					// Worker was invalid, try next
					this.lockNextWorker(resource)
					return
				}

				resource.holder = nextWorker

				logger.info(
					`Resource: ${resource.id} giving to "${nextWorker[0]}". ${resource.waitingWorkers.length} waiting`
				)

				worker.workerLockChange(nextWorker[1], true).catch((e) => {
					logger.error(`Failed to report lock to worker: ${e}`)
					if (
						resource.holder &&
						resource.holder[0] === nextWorker[0] &&
						resource.holder[1] === nextWorker[1]
					) {
						// free it as the aquire was 'rejected'
						resource.holder = null
						this.lockNextWorker(resource)
					}
				})
			}
		}
	}

	async subscribe(worker: WorkerParentBase): Promise<void> {
		const id = getRandomString()
		this.#ids.set(id, worker)

		const cb = (e: AnyLockEvent): void => {
			try {
				const resource = this.getResource(e.resourceId)

				switch (e.event) {
					case 'lock':
						resource.waitingWorkers.push([id, e.lockId])

						// Check if we can lock it
						this.lockNextWorker(resource)

						break
					case 'unlock':
						if (resource.holder && resource.holder[0] === id && resource.holder[1] === e.lockId) {
							resource.holder = null

							logger.info(
								`Resource: ${resource.id} releaseing from "${id}". ${resource.waitingWorkers.length} waiting`
							)

							worker.workerLockChange(e.lockId, false).catch((e) => {
								logger.error(`Failed to report lock to worker: ${e}`)
							})
						} else {
							logger.warn(`Worker tried to unlock a lock it doesnt own`)
						}

						this.lockNextWorker(resource)
						break
					default:
						assertNever(e)
						break
				}
			} catch (e) {
				logger.error(`Unexpected error in lock handler: ${e}`)
			}
		}
		worker.on('lock', cb)
		this.#subs.set(id, () => {
			// Unsub function
			worker.off('lock', cb)
		})
	}

	/** Unsubscribe a worker from the lock channels */
	async unsubscribe(worker: WorkerParentBase): Promise<void> {
		const idPair = Array.from(this.#ids.entries()).find((w) => w[1] === worker)
		if (idPair) {
			const id = idPair[0]
			this.#ids.delete(id)

			// stop listening
			const unsub = this.#subs.get(id)
			if (unsub) unsub()

			// ensure all locks are freed
			for (const resource of this.#resources.values()) {
				if (resource.waitingWorkers.length > 0) {
					// Remove this worker from any waiting orders
					resource.waitingWorkers = resource.waitingWorkers.filter((r) => r[0] !== id)
				}

				if (resource.holder && resource.holder[0] === id) {
					// Remove this worker from any held locks
					resource.holder = null
					this.lockNextWorker(resource)
				}
			}
		}
	}
}
