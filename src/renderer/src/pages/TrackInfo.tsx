import TrackInfoProgress from '@renderer/components/TrackInfo/TrackInfoProgress'
import TrackInfoSession from '@renderer/components/TrackInfo/TrackInfoSession'
import { speed3 } from '@renderer/constants/refreshIntervals'
import LiveTiming from '@renderer/hooks/useLiveTiming'
import { ILiveTimingState } from '@renderer/types/LiveTimingStateTypes'
import { useState } from 'react'
import styles from '@renderer/components/TrackInfo/TrackInfo.module.scss'
import useSessionTimer from '@renderer/hooks/useSessionTimer'
import TrackInfoPitlane from '@renderer/components/TrackInfo/TrackInfoPitlane'
import TrackInfoDrs from '@renderer/components/TrackInfo/TrackInfoDrs'
import TrackInfoHeadPadding from '@renderer/components/TrackInfo/TrackInfoHeadPadding'
import TrackInfoGrip from '@renderer/components/TrackInfo/TrackInfoGrip'
import { trackInfoSettings } from '@renderer/modules/Settings'

const TrackInfo = () => {
  const [stateData, setStateData] = useState<ILiveTimingState>({} as ILiveTimingState)

  const { sessionTime, extraPolating, sessionTimeMs } = useSessionTimer()

  const handleDataReceived = (data: ILiveTimingState) => {
    console.log(data)
    if (JSON.stringify(data) === JSON.stringify(stateData)) return console.log('same data')
    setStateData(data)
  }

  const vertical = trackInfoSettings?.settings?.orientation?.value === 'vertical'

  console.log(trackInfoSettings)

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
    <div className={vertical ? styles.vertical : ''}>
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
        <TrackInfoGrip data={{ RaceControlMessages }} />
        <TrackInfoHeadPadding data={{ RaceControlMessages }} />
        <TrackInfoDrs data={{ RaceControlMessages }} />
        <TrackInfoPitlane data={{ SessionStatus, RaceControlMessages }} />
      </div>
    </div>
  )
}

export default TrackInfo
