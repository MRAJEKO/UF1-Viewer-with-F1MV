import { milisecondsToTime } from './../utils/convertTime'
import { useState, useEffect, useCallback } from 'react'
import useData from './useLiveTiming'
import useLiveTimingClock, { ILiveTimingClockData } from './useLiveTimingClock'
import { calculateTrackTime } from '@renderer/utils/trackTime'
import { speed4, speed5, speed7 } from '@renderer/constants/refreshIntervals'

const useTrackTime = (speed?: number) => {
  const [liveTimingClockData, setLiveTimingClockData] = useState<null | ILiveTimingClockData>(null)
  const [GmtOffset, setGmtOffset] = useState<string>('00:00:00')
  const [now, setNow] = useState<number>(new Date().getTime())

  useEffect(() => {
    const interval = setInterval(() => {
      if (!liveTimingClockData?.paused) setNow(new Date().getTime())
    }, speed ?? speed5)

    return () => clearInterval(interval)
  }, [liveTimingClockData])

  const handleDataReceived = useCallback(
    (data: ILiveTimingClockData) => {
      if (!data) return

      if (JSON.stringify(data) === JSON.stringify(liveTimingClockData)) return

      setNow(new Date().getTime())

      setLiveTimingClockData(data)
    },
    [liveTimingClockData]
  )

  useLiveTimingClock(
    ['paused', 'systemTime', 'trackTime', 'liveTimingStartTime'],
    handleDataReceived,
    speed4
  )

  const handleSessionInfoReceived = useCallback(
    (data: any) => {
      if (!data?.SessionInfo) return

      const dataGmtOffset = data.SessionInfo.GmtOffset

      if (dataGmtOffset && dataGmtOffset !== GmtOffset) setGmtOffset(dataGmtOffset)
    },
    [GmtOffset]
  )

  useData(['SessionInfo'], handleSessionInfoReceived, speed7)

  const localTime = calculateTrackTime(now, liveTimingClockData, GmtOffset)

  const trackTime = milisecondsToTime(localTime)

  const paused = liveTimingClockData?.paused

  const trackTimeUtc = calculateTrackTime(now, liveTimingClockData, null)

  return { trackTimeUtc, trackTime, paused }
}

export default useTrackTime
