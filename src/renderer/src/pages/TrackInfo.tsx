import TrackInfoProgress from '@renderer/components/TrackInfo/TrackInfoProgress'
import TrackInfoSession from '@renderer/components/TrackInfo/TrackInfoSession'
import { speed3 } from '@renderer/constants/refreshIntervals'
import LiveTiming from '@renderer/hooks/useLiveTiming'
import { ILiveTimingState } from '@renderer/types/LiveTimingStateTypes'
import { useState } from 'react'
import styles from '@renderer/components/TrackInfo/TrackInfo.module.scss'
import useSessionTimer from '@renderer/hooks/useSessionTimer'

const TrackInfo = () => {
  const [stateData, setStateData] = useState<ILiveTimingState>({} as ILiveTimingState)

  const { sessionTime, extraPolating, sessionTimeMs } = useSessionTimer()

  const handleDataReceived = (data: ILiveTimingState) => setStateData(data)

  LiveTiming(
    [
      'SessionStatus',
      'RaceControlMessages',
      'SessionInfo',
      'TimingData',
      'LapCount',
      'TimingStats'
    ],
    handleDataReceived,
    speed3
  )

  const { SessionStatus, RaceControlMessages, SessionInfo, TimingStats, TimingData, LapCount } =
    stateData

  return (
    <div className={styles.container}>
      <TrackInfoSession
        sessionTime={sessionTime}
        extraPolating={extraPolating}
        data={{ SessionStatus, RaceControlMessages }}
      />
      <TrackInfoProgress
        sessionTimeMs={sessionTimeMs}
        data={{ TimingData, SessionInfo, TimingStats, LapCount, SessionStatus }}
      />
    </div>
  )
}

export default TrackInfo
