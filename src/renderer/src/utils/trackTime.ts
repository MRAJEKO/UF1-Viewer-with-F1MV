import { ILiveTimingClockData } from '@renderer/hooks/useLiveTimingClock'
import { timeToMiliseconds } from './convertTime'

export const calculateTrackTime = (
  now: number,
  liveTimingClockData: ILiveTimingClockData | null,
  GmtOffset: string | null
) => {
  if (!liveTimingClockData) return 0

  const systemTime = parseInt(liveTimingClockData?.systemTime)
  const trackTime = parseInt(liveTimingClockData?.trackTime)
  const paused = liveTimingClockData?.paused

  if (!GmtOffset) return paused ? trackTime : now - (systemTime - trackTime)

  return paused
    ? trackTime + timeToMiliseconds(GmtOffset)
    : now - (systemTime - trackTime) + timeToMiliseconds(GmtOffset)
}
