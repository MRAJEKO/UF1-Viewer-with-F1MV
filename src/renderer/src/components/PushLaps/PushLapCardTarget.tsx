import { ITimingData, ITimingStats, IDriverList } from '@renderer/types/LiveTimingStateTypes'
import styles from './PushLapCardTarget.module.scss'

interface IPushLapCardTargetProps {
  data: {
    timingData?: ITimingData
    timingStats?: ITimingStats
    driverList?: IDriverList
  }
}

const PushLapCardTarget = ({}: IPushLapCardTargetProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.times}>
        <div className={styles.delta}>
          <p>+0.452</p>
        </div>
        <div className={styles.time}>
          <p>1:15.000</p>
        </div>
      </div>
      <div className={styles.info}>
        <div className={styles.position}>
          <p>P1</p>
        </div>
        <div className={styles.name}>
          <p>VER</p>
        </div>
      </div>
    </div>
  )
}
export default PushLapCardTarget
