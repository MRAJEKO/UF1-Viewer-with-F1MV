import TrackTimeClock from '@renderer/components/TrackTime/TrackTimeClock'
import LiveTiming from '@renderer/hooks/useLiveTiming'
import LiveTimingClock, { ILiveTimingClockData } from '@renderer/hooks/useLiveTimingClock'
import { useCallback, useEffect, useState } from 'react'
import styles from '@renderer/components/TrackTime/TrackTime.module.scss'

const TrackTime = () => {
  const [liveTimingClockData, setLiveTimingClockData] = useState<null | ILiveTimingClockData>(null)
  const [GmtOffset, setGmtOffset] = useState<string>('00:00:00')
  const [now, setNow] = useState<number>(new Date().getTime())

  useEffect(() => {
    const interval = setInterval(() => {
      if (!liveTimingClockData?.paused) setNow(new Date().getTime())
    }, 1000)

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

  LiveTimingClock(
    ['paused', 'systemTime', 'trackTime', 'liveTimingStartTime'],
    handleDataReceived,
    500
  )

  console.log(liveTimingClockData)

  const handleSessionInfoReceived = useCallback(
    (data: any) => {
      if (!data?.SessionInfo) return

      const dataGmtOffset = data.SessionInfo.GmtOffset

      if (dataGmtOffset && dataGmtOffset !== GmtOffset) setGmtOffset(dataGmtOffset)
    },
    [GmtOffset]
  )

  LiveTiming(['SessionInfo'], handleSessionInfoReceived, 2500)

  return (
    <div className={styles.container}>
      <TrackTimeClock now={now} liveTimingClockData={liveTimingClockData} GmtOffset={GmtOffset} />
    </div>
  )
}

export default TrackTime
