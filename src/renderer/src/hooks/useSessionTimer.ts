import useLiveTimingStateClock from '@renderer/hooks/useLiveTimingStateClock'
import { useCallback, useState } from 'react'
import { ILiveTimingClockData } from './useLiveTimingClock'
import { IExtrapolatedClock } from '@renderer/types/LiveTimingStateTypes'
import { calculateSessionTime } from '@renderer/utils/timers'
import { milisecondsToTime } from '@renderer/utils/convertTime'
import { speed4 } from '@renderer/constants/refreshIntervals'

interface IData {
  ExtrapolatedClock: IExtrapolatedClock
}

const useSessionTimer = () => {
  const [now, setNow] = useState<number>(new Date().getTime())
  const [liveTimingClockData, setLiveTimingClockData] = useState<null | ILiveTimingClockData>(null)
  const [extraPolatedClock, setExtraPolatedClock] = useState<null | IExtrapolatedClock>(null)

  const handleDataReceived = useCallback(
    (stateData: IData, clockData: ILiveTimingClockData) => {
      if (!stateData || !clockData) return

      const { ExtrapolatedClock } = stateData

      if (JSON.stringify(ExtrapolatedClock) !== JSON.stringify(extraPolatedClock))
        setExtraPolatedClock(ExtrapolatedClock)

      setNow(new Date().getTime())

      if (JSON.stringify(clockData) !== JSON.stringify(liveTimingClockData))
        setLiveTimingClockData(clockData)
    },
    [liveTimingClockData]
  )

  useLiveTimingStateClock(
    ['ExtrapolatedClock'],
    ['paused', 'systemTime', 'trackTime', 'liveTimingStartTime'],
    handleDataReceived,
    speed4
  )

  if (!liveTimingClockData || !extraPolatedClock)
    return { sessionTime: '00:00:00', extraPolating: false }

  const sessionTimeMs = calculateSessionTime(
    now,
    liveTimingClockData?.trackTime,
    liveTimingClockData?.systemTime,
    liveTimingClockData?.paused,
    extraPolatedClock?.Utc,
    extraPolatedClock?.Remaining,
    extraPolatedClock?.Extrapolating
  )

  const sessionTime = sessionTimeMs ? milisecondsToTime(sessionTimeMs) : '00:00:00'

  const extraPolating = extraPolatedClock?.Extrapolating

  return { sessionTime, extraPolating, sessionTimeMs }
}

export default useSessionTimer
