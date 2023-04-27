import LiveTiming from '../services/liveTiming'
import { useCallback, useEffect, useState } from 'react'
import TrackStatus from '@renderer/components/FlagDisplay/TrackStatus'
import SessionStatus from '@renderer/components/FlagDisplay/SessionStatus'
import styles from '@renderer/components/FlagDisplay/Panels.module.css'
import FastestLap from '@renderer/components/FlagDisplay/FastestLap'
import GoveeIntegration from '@renderer/components/FlagDisplay/Govee'

const FlagDisplay = () => {
  const [trackStatus, setTrackStatus] = useState<null | number>(null)
  const [trackStatusColor, setTrackStatusColor] = useState<null | string>(null)

  const [sessionStatus, setSessionStatus] = useState<null | string>(null)
  const [sessionStatusColor, setSessionStatusColor] = useState<null | string>(null)

  const [fastestLap, setFastestLap] = useState<null | string>(null)
  const [fastestLapColor, setFastestLapColor] = useState<null | string>(null)

  const [goveeEnabled, setGoveeEnabled] = useState<boolean>(false)

  useEffect(() => {
    window.ipcRenderer.invoke('get-store').then((store: any) => {
      setGoveeEnabled(store.config.flag_display.settings.govee.value)
    })
  }, [])

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

  console.log(trackStatusColor, sessionStatusColor, fastestLapColor)

  return (
    <div className={styles.container}>
      <GoveeIntegration
        status={goveeEnabled}
        colors={[fastestLapColor, sessionStatusColor, trackStatusColor]}
      />
      <TrackStatus
        status={trackStatus}
        onColorChange={(color) => goveeEnabled && setTrackStatusColor(color)}
      />
      <SessionStatus
        status={sessionStatus}
        onColorChange={(color) => goveeEnabled && setSessionStatusColor(color)}
      />
      <FastestLap
        fastestLap={fastestLap}
        onColorChange={(color) => goveeEnabled && setFastestLapColor(color)}
      />
    </div>
  )
}

export default FlagDisplay
