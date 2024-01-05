import Colors from '@renderer/modules/Colors'
import {
  IDriverList,
  ITimingData,
  ITimingDataLine,
  ITimingStatsLine
} from '@renderer/types/LiveTimingStateTypes'
import { parseLapOrSectorTime } from '@renderer/utils/convertTime'
import { lapCompleted } from '@renderer/utils/driver'
import styles from './PushLapCardTarget.module.scss'

interface IPushLapCardTargetProps {
  pushing: boolean
  driverNumber: string
  firstSectorCompleted: boolean
  data: {
    timingData?: ITimingData
    driverList?: IDriverList
  }
  targetData?: {
    timingData?: ITimingDataLine
    timingStats?: ITimingStatsLine
  }
}

const PushLapCardTarget = ({
  pushing,
  driverNumber,
  data,
  targetData,
  firstSectorCompleted
}: IPushLapCardTargetProps) => {
  const { timingData, driverList } = data

  const targetTimingData = targetData?.timingData
  const targetTimingStats = targetData?.timingStats

  const targetDriver = driverList?.[targetTimingData?.RacingNumber ?? '']

  const driverTimingData = timingData?.Lines?.[driverNumber]

  const targetTime = timingData?.Lines?.[targetTimingData?.RacingNumber ?? '']?.BestLapTime?.Value

  if (!targetDriver || !targetTime || !targetTimingData || !targetTimingStats) return null

  const isLapCompleted = lapCompleted(driverTimingData)

  const totalTargetDelta =
    !pushing && !firstSectorCompleted && isLapCompleted
      ? parseLapOrSectorTime(driverTimingData?.LastLapTime?.Value) -
        parseLapOrSectorTime(targetTimingData?.BestLapTime?.Value)
      : driverTimingData?.Sectors?.reduce((acc, sector, index) => {
          if (!firstSectorCompleted || !sector?.Value) return acc

          const targetSectorTime = targetTimingStats?.BestSectors?.[index]?.Value

          if (!targetSectorTime) return acc

          return acc + (parseFloat(sector.Value) - parseFloat(targetSectorTime))
        }, 0)

  const positive = totalTargetDelta && totalTargetDelta > 0

  return (
    <div className={styles.container}>
      <div className={styles.times}>
        <div className={styles.delta}>
          <p style={{ color: positive ? Colors.yellow : Colors.green }}>
            {positive ? '+' : ''}
            {totalTargetDelta?.toFixed(3)}
          </p>
        </div>
        <div className={styles.time}>
          <p>{targetTime}</p>
        </div>
      </div>
      <div className={styles.info}>
        <div className={styles.position}>
          <p>P{targetTimingData?.Position}</p>
        </div>
        <div className={styles.name}>
          <p>{targetDriver?.Tla ?? 'UNK'}</p>
        </div>
      </div>
    </div>
  )
}
export default PushLapCardTarget
