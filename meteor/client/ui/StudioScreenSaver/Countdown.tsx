import * as React from 'react'
import { translateWithTracker, Translated } from '../../lib/ReactMeteorData/ReactMeteorData'
import { getCurrentTimeReactive } from '../../lib/currentTimeReactive'

function floorCeil(val) {
	return val < 0 ? Math.ceil(val) : Math.floor(val)
}

export const Countdown = translateWithTracker<
	{ expectedStart: number; className?: string | undefined },
	{},
	{ now: number }
>(() => {
	return {
		now: getCurrentTimeReactive(),
	}
})(
	class Countdown extends React.Component<
		Translated<{ expectedStart: number; now: number; className?: string | undefined }>
	> {
		render() {
			const { t, expectedStart, now, className } = this.props
			const diff = expectedStart - now

			const days = floorCeil(diff / 86400000)
			const hours = floorCeil((diff % 86400000) / 3600000)
			const minutes = floorCeil((diff % 3600000) / 60000)
			const seconds = floorCeil((diff % 60000) / 1000)

			return (
				<div className={className}>
					{days > 0
						? t('in {{days}} days, {{hours}} h {{minutes}} min {{seconds}} s', { days, hours, minutes, seconds })
						: hours > 0
						? t('in {{hours}} h {{minutes}} min {{seconds}} s', { days, hours, minutes, seconds })
						: minutes > 0
						? t('in {{minutes}} min {{seconds}} s', { days, hours, minutes, seconds })
						: seconds > 0
						? t('in {{seconds}} s', { days, hours, minutes, seconds })
						: days < 0
						? t('{{days}} days, {{hours}} h {{minutes}} min {{seconds}} s ago', { days, hours, minutes, seconds })
						: hours < 0
						? t('{{hours}} h {{minutes}} min {{seconds}} s ago', { days, hours, minutes, seconds })
						: minutes < 0
						? t('{{minutes}} min {{seconds}} s ago', { days, hours, minutes, seconds })
						: seconds <= 0
						? t('{{seconds}} s ago', { days, hours, minutes, seconds })
						: null}
				</div>
			)
		}
	}
)
