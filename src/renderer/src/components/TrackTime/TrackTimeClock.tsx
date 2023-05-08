import { ILiveTimingClockData } from '@renderer/hooks/useLiveTimingClock'
import { milisecondsToTime } from '@renderer/utils/convertTime'
import { calculateTrackTime } from '@renderer/utils/trackTime'

interface Props {
  now: number
  liveTimingClockData: ILiveTimingClockData | null
  GmtOffset: string
}

const TrackTimeClock = ({ now, liveTimingClockData, GmtOffset }: Props) => {
  const localTime = calculateTrackTime(now, liveTimingClockData, GmtOffset)

  if (!localTime) return <div>00:00:00</div>

  const displayTime = milisecondsToTime(localTime)

  return <div>{displayTime}</div>
}

export default TrackTimeClock
