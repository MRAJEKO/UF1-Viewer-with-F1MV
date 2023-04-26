import LiveTiming from '../services/liveTiming'
import { useCallback, useState } from 'react'
import TrackStatus from '@renderer/components/FlagDisplay/TrackStatus'
import SessionStatus from '@renderer/components/FlagDisplay/SessionStatus'
import styles from '@renderer/components/FlagDisplay/Panels.module.css'
import FastestLap from '@renderer/components/FlagDisplay/FastestLap'

const FlagDisplay = () => {
  const [trackStatus, setTrackStatus] = useState<null | number>(null)
  const [sessionStatus, setSessionStatus] = useState<null | string>(null)
  const [fastestLap, setFastestLap] = useState<null | string>(null)

  const onDataReceived = useCallback(
    (data: any) => {
      if (data) {
        if (parseInt(data?.TrackStatus?.Status ?? 0) !== trackStatus)
          setTrackStatus(parseInt(data?.TrackStatus?.Status ?? 0))

        const newFastestLap = Object.values(data?.TimingStats?.Lines ?? {})
          .map((driverTimingStats: any) => driverTimingStats.PersonalBestLapTime)
          .filter((personalBestLapTime: any) => personalBestLapTime.Position == 1)[0]?.Value

        if (newFastestLap && newFastestLap !== fastestLap) setFastestLap(newFastestLap)

        data?.SessionStatus?.Status !== sessionStatus &&
          setSessionStatus(data?.SessionStatus?.Status)
      }
    },
    [trackStatus, fastestLap, sessionStatus]
  )

  LiveTiming(['TrackStatus', 'SessionStatus', 'TimingStats'], onDataReceived, 250)

  console.log(sessionStatus)

  return (
    <div className={styles.container}>
      <TrackStatus status={trackStatus} />
      <SessionStatus status={sessionStatus} />
      <FastestLap fastestLap={fastestLap} />
    </div>
  )
}

export default FlagDisplay
