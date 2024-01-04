import {
  IDriverList,
  ISessionInfo,
  ITimingData,
  ITimingDataLine,
  ITimingStats
} from '@renderer/types/LiveTimingStateTypes'
import styles from './PushLapCardTarget.module.scss'

interface IPushLapCardTargetProps {
  driverNumber: string
  data: {
    timingData?: ITimingData
    timingStats?: ITimingStats
    driverList?: IDriverList
    sessionType?: ISessionInfo['Type']
  }
  targetData?: ITimingDataLine
}

const PushLapCardTarget = ({ driverNumber, data, targetData }: IPushLapCardTargetProps) => {
  const { timingData, timingStats, driverList, sessionType } = data

  const targetDriver = driverList?.[targetData?.RacingNumber ?? '']

  const targetTime = timingData?.Lines?.[targetData?.RacingNumber ?? '']?.BestLapTime?.Value

  if (!targetDriver || !targetTime || !targetData) return null

  return (
    <div className={styles.container}>
      <div className={styles.times}>
        <div className={styles.delta}>
          <p>+0.452</p>
        </div>
        <div className={styles.time}>
          <p>{targetTime}</p>
        </div>
      </div>
      <div className={styles.info}>
        <div className={styles.position}>
          <p>P{targetData?.Position}</p>
        </div>
        <div className={styles.name}>
          <p>{targetDriver?.Tla ?? 'UNK'}</p>
        </div>
      </div>
    </div>
  )
}
export default PushLapCardTarget
