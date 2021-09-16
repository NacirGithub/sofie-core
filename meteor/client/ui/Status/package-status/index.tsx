import * as React from 'react'
import { Translated, translateWithTracker } from '../../../lib/ReactMeteorData/react-meteor-data'
import { MeteorReactComponent } from '../../../lib/MeteorReactComponent'
import { PubSub } from '../../../../lib/api/pubsub'
import {
	ExpectedPackageWorkStatus,
	ExpectedPackageWorkStatuses,
} from '../../../../lib/collections/ExpectedPackageWorkStatuses'
import { unprotectString } from '../../../../lib/lib'
import { ExpectedPackageDB, ExpectedPackages } from '../../../../lib/collections/ExpectedPackages'
import { MeteorCall } from '../../../../lib/api/methods'
import { doUserAction, UserAction } from '../../../lib/userAction'
import { Studios } from '../../../../lib/collections/Studios'
import { Meteor } from 'meteor/meteor'
import { PackageStatus } from './PackageStatus'
import { PackageContainerStatusDB, PackageContainerStatuses } from '../../../../lib/collections/PackageContainerStatus'
import { PackageContainerStatus } from './PackageContainerStatus'
import { Spinner } from '../../../lib/Spinner'

interface IIExpectedPackagesStatusTrackedProps {
	expectedPackageWorkStatuses: ExpectedPackageWorkStatus[]
	expectedPackages: ExpectedPackageDB[]
	packageContainerStatuses: PackageContainerStatusDB[]
}
interface IIExpectedPackagesStatusState {
	allSubsReady: boolean
}

export const ExpectedPackagesStatus = translateWithTracker<{}, {}, IIExpectedPackagesStatusTrackedProps>(() => {
	return {
		expectedPackageWorkStatuses: ExpectedPackageWorkStatuses.find({}).fetch(),
		expectedPackages: ExpectedPackages.find({}).fetch(),
		packageContainerStatuses: PackageContainerStatuses.find().fetch(),
	}
})(
	class PackageManagerStatus extends MeteorReactComponent<
		Translated<IIExpectedPackagesStatusTrackedProps>,
		IIExpectedPackagesStatusState
	> {
		constructor(props) {
			super(props)
			this.state = {
				allSubsReady: false,
			}
		}

		componentDidMount() {
			// Subscribe to data:
			this.autorun(() => {
				// Hack: We should add a studio selector in the GUI instead
				const studioIds = Studios.find()
					.fetch()
					.map((studio) => studio._id)

				console.log('studioIds', studioIds)
				const subs = [
					this.subscribe(PubSub.expectedPackageWorkStatuses, {
						studioId: { $in: studioIds },
					}),
					this.subscribe(PubSub.expectedPackages, {
						studioId: { $in: studioIds },
					}),
					this.subscribe(PubSub.packageContainerStatuses, {
						studioId: { $in: studioIds },
					}),
				]

				this.autorun(() => {
					const allSubsReady = subs.reduce((memo, sub) => {
						return memo && sub.ready()
					}, true)
					this.setState({ allSubsReady: studioIds.length > 0 && allSubsReady })
				})
			})
		}
		restartAllExpectations(e: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
			const studio = Studios.findOne()
			if (!studio) throw new Meteor.Error(404, `No studio found!`)

			doUserAction(this.props.t, e, UserAction.PACKAGE_MANAGER_RESTART_WORK, (e) =>
				MeteorCall.userAction.packageManagerRestartAllExpectations(e, studio._id)
			)
		}
		renderExpectedPackageStatuses() {
			const { t } = this.props

			const packageRef: { [packageId: string]: ExpectedPackageDB } = {}
			for (const expPackage of this.props.expectedPackages) {
				packageRef[unprotectString(expPackage._id)] = expPackage
			}

			const packagesWithWorkStatuses: {
				[packageId: string]: {
					package: ExpectedPackageDB | undefined
					statuses: ExpectedPackageWorkStatus[]
				}
			} = {}
			for (const work of this.props.expectedPackageWorkStatuses) {
				// todo: make this better:
				const key = unprotectString(work.fromPackages[0]?.id) || 'unknown_work_' + work._id
				// const referencedPackage = packageRef[packageId]
				let packageWithWorkStatus = packagesWithWorkStatuses[key]
				if (!packageWithWorkStatus) {
					packagesWithWorkStatuses[key] = packageWithWorkStatus = {
						package: packageRef[key] || undefined,
						statuses: [],
					}
				}
				packageWithWorkStatus.statuses.push(work)
			}

			for (const id of Object.keys(packagesWithWorkStatuses)) {
				packagesWithWorkStatuses[id].statuses.sort(compareWorkStatus)
			}
			// sort, so that incompleted packages are put first:
			const keys: { packageId: string; incompleteRank: number; created: number }[] = []
			Object.keys(packagesWithWorkStatuses).forEach((packageId) => {
				const p = packagesWithWorkStatuses[packageId]

				let incompleteRank = 999
				for (const status of p.statuses) {
					if (status.status !== 'fulfilled') {
						if (status.requiredForPlayout) {
							incompleteRank = Math.min(incompleteRank, 0)
						} else {
							incompleteRank = Math.min(incompleteRank, 1)
						}
					}
				}
				keys.push({
					packageId,
					created: p.package?.created ?? 0,
					incompleteRank,
				})
			})

			keys.sort((a, b) => {
				// Incomplete first:
				if (a.incompleteRank > b.incompleteRank) return 1
				if (a.incompleteRank < b.incompleteRank) return -1

				if (a.created < b.created) return 1
				if (a.created > b.created) return -1

				if (a.packageId < b.packageId) return 1
				if (a.packageId > b.packageId) return -1

				return 0
			})

			return keys.map(({ packageId }) => {
				const p = packagesWithWorkStatuses[packageId]

				return p.package ? (
					<PackageStatus key={packageId} package={p.package} statuses={p.statuses} />
				) : (
					<tr className="package" key={packageId}>
						<td colSpan={99}>{t('Unknown Package "{{packageId}}"', { packageId })}</td>
					</tr>
				)
			})
		}
		renderPackageContainerStatuses() {
			return this.props.packageContainerStatuses.map((packageContainerStatus) => {
				return (
					<PackageContainerStatus
						key={unprotectString(packageContainerStatus._id)}
						packageContainerStatus={packageContainerStatus}
					/>
				)
			})
		}
		render() {
			const { t } = this.props

			return (
				<div className="mhl gutter package-status">
					<header className="mbs">
						<h1>{t('Package Status')}</h1>
					</header>

					{this.state.allSubsReady ? (
						<>
							<div className="row">
								<div className="col c12 rl-c6">
									<header className="mbs">
										<h2>{t('Package container status')}</h2>
									</header>
								</div>
							</div>
							<table className="mod mvl packageContainer-status-list">
								<tbody>
									<tr className="packageContainer-status__header">
										<th colSpan={2}>{t('Id')}</th>
										<th colSpan={2}>{t('Status')}</th>
										<th></th>
									</tr>
									{this.renderPackageContainerStatuses()}
								</tbody>
							</table>

							<div className="row">
								<div className="col c12 rl-c6">
									<header className="mbs">
										<h2>{t('Work status')}</h2>
									</header>
								</div>
								<div className="col c12 rl-c6 alright">
									<button className="btn btn-secondary mls" onClick={(e) => this.restartAllExpectations(e)}>
										{t('Restart All jobs')}
									</button>
								</div>
							</div>

							<table className="mod mvl package-status-list">
								<tbody>
									<tr className="package-status__header">
										<th colSpan={2}>{t('Status')}</th>
										<th>{t('Name')}</th>
										<th>{t('Created')}</th>
										<th></th>
									</tr>
									{this.renderExpectedPackageStatuses()}
								</tbody>
							</table>
						</>
					) : (
						<Spinner />
					)}
				</div>
			)
		}
	}
)

function compareWorkStatus(a: ExpectedPackageWorkStatus, b: ExpectedPackageWorkStatus): number {
	if ((a.displayRank || 0) > (b.displayRank || 0)) return 1
	if ((a.displayRank || 0) < (b.displayRank || 0)) return -1

	if (a.requiredForPlayout && !b.requiredForPlayout) return 1
	if (!a.requiredForPlayout && b.requiredForPlayout) return -1

	if (a.label > b.label) return 1
	if (a.label < b.label) return -1

	return 0
}
