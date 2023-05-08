import LiveTiming from '../hooks/useLiveTiming'
import { useCallback, useEffect, useState } from 'react'
import TrackStatus from '@renderer/components/FlagDisplay/TrackStatusPanel'
import SessionStatus from '@renderer/components/FlagDisplay/SessionStatusPanel'
import styles from '@renderer/components/FlagDisplay/Panels.module.css'
import FastestLap from '@renderer/components/FlagDisplay/FastestLapPanel'
import GoveeIntegration from '@renderer/components/FlagDisplay/GoveePanel'
import colors from '@renderer/modules/Colors'
import { goveeEnabled } from '@renderer/modules/Settings'

const FlagDisplay = () => {
  const [trackStatus, setTrackStatus] = useState<null | number>(null)
  const [trackStatusColor, setTrackStatusColor] = useState<null | string>(null)

  const [sessionStatus, setSessionStatus] = useState<null | string>(null)
  const [sessionStatusColor, setSessionStatusColor] = useState<null | string>(null)

  const [fastestLap, setFastestLap] = useState<null | string>(null)
  const [fastestLapColor, setFastestLapColor] = useState<null | string>(null)

  const [goveeUsed, setGoveeUsed] = useState<boolean>(false)

  useEffect(() => {
    window.addEventListener('beforeunload', () => {
      if (goveeUsed && goveeEnabled) localStorage.removeItem('goveeUsed')
    })
  }, [goveeUsed])

  useEffect(() => {
    const goveeUsed = localStorage.getItem('goveeUsed')

    if (!goveeUsed && goveeEnabled) {
      localStorage.setItem('goveeUsed', 'true')
      setGoveeUsed(true)
    }
  }, [])

  const handleDataReceived = useCallback(
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

  LiveTiming(['TrackStatus', 'SessionStatus', 'TimingStats'], handleDataReceived, 250)

  return (
    <div className={styles.container} style={{ backgroundColor: colors?.['default'] ?? 'black' }}>
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
      {goveeEnabled && (
        <GoveeIntegration colors={[fastestLapColor, sessionStatusColor, trackStatusColor]} />
      )}
    </div>
  )
}

export default FlagDisplay
