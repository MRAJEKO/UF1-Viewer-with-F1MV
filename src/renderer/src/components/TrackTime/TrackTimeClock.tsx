import { ILiveTimingClockData } from '@renderer/hooks/useLiveTimingClock'
import { milisecondsToTime, timeToMiliseconds } from '@renderer/utils/convertTime'

interface Props {
  now: number
  liveTimingClockData: ILiveTimingClockData | null
  GmtOffset: string
}

const TrackTimeClock = ({ now, liveTimingClockData, GmtOffset }: Props) => {
  if (!liveTimingClockData) return <p>NO DATA</p>

  const systemTime = parseInt(liveTimingClockData.systemTime)
  const trackTime = parseInt(liveTimingClockData.trackTime)
  const paused = liveTimingClockData.paused

  const localTime = paused
    ? trackTime + timeToMiliseconds(GmtOffset)
    : now - (systemTime - trackTime) + timeToMiliseconds(GmtOffset)

  const displayTime = milisecondsToTime(localTime)

  return <div>{displayTime}</div>
}

export default TrackTimeClock
