import useLiveTiming from '../hooks/useLiveTiming'
import { useCallback, useEffect, useState } from 'react'
import TrackStatus from '@renderer/components/FlagDisplay/TrackStatusPanel'
import SessionStatus from '@renderer/components/FlagDisplay/SessionStatusPanel'
import styles from '@renderer/components/FlagDisplay/Panels.module.scss'
import FastestLap from '@renderer/components/FlagDisplay/FastestLapPanel'
import GoveeIntegration from '@renderer/components/FlagDisplay/GoveePanel'
import colors from '@renderer/modules/Colors'
import { goveeEnabled } from '@renderer/modules/Settings'
import { speed3 } from '@renderer/constants/refreshIntervals'
import { ISessionStatus, ITimingStats, ITrackStatus } from '@renderer/types/LiveTimingStateTypes'
import { calculateFastestLap } from '@renderer/utils/calculateFastestLap'

interface IData {
  TrackStatus?: ITrackStatus
  SessionStatus?: ISessionStatus
  TimingStats?: ITimingStats
}

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
    (data: IData) => {
      const { TrackStatus, SessionStatus, TimingStats } = data

      if (data) {
        if (parseInt(TrackStatus?.Status ?? '0') !== trackStatus)
          setTrackStatus(parseInt(TrackStatus?.Status ?? '0'))

        const newFastestLap = calculateFastestLap(TimingStats)

        if (newFastestLap && newFastestLap !== fastestLap) setFastestLap(newFastestLap)

        data?.SessionStatus?.Status !== sessionStatus &&
          setSessionStatus(SessionStatus?.Status ?? null)
      }
    },
    [trackStatus, fastestLap, sessionStatus]
  )

  useLiveTiming(['TrackStatus', 'SessionStatus', 'TimingStats'], handleDataReceived, speed3)

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
