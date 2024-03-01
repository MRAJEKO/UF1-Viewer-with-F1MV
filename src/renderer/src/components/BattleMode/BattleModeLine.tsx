import styles from '@renderer/components/BattleMode/BattleModeLine.module.scss'
import { ILiveTimingData } from '@renderer/pages/BattleMode'
import { getTyreIcon } from '@renderer/utils/tyre'

interface IProps {
  driverAhead: string | undefined
  driver: string
  liveTimingData: ILiveTimingData | null
  index: number
}

const BattleModeLine = ({ driverAhead, driver, liveTimingData, index }: IProps) => {
  const { TimingData, DriverList, CarData, TimingAppData } = liveTimingData || {}

  const driverAheadTimingData = driverAhead ? TimingData?.Lines?.[driverAhead] : null
  const driverAheadGapToLeader = driverAheadTimingData?.GapToLeader

  const driverTimingData = TimingData?.Lines?.[driver]

  const driverTimingAppData = TimingAppData?.Lines?.[driver]

  const ahead = (() => {
    const driverGapToLeader = driverTimingData?.GapToLeader

    if (driverGapToLeader?.includes('LAP')) return 'INTERVAL'

    if (driverAheadGapToLeader?.includes('LAP')) return driverGapToLeader

    if (!driverAheadGapToLeader || !driverGapToLeader) return ''

    const gap = parseFloat(driverGapToLeader) - parseFloat(driverAheadGapToLeader)

    if (gap > 0) return `+${gap.toFixed(3)}`

    return gap.toFixed(3)
  })()

  const driverInfo = DriverList?.[driver]

  const position = driverTimingData?.Position

  return (
    <div className={styles.container}>
      <div className={styles['basic-info']}>
        <div className={styles.position}>
          <p>{position || '?'}</p>
        </div>
        <div
          className={styles.color}
          style={{ backgroundColor: `#${driverInfo?.TeamColour || 'fff'}` }}
        />
        <p className={styles.name}>{driverInfo?.LastName?.toUpperCase() || driverInfo?.Tla}</p>
      </div>
      <div className={styles.tyre}>
        <img src={getTyreIcon(driverTimingAppData?.Stints?.[0]?.Compound)} alt="" />
      </div>
      <div className={styles.gap}>
        <p style={{ fontFamily: index === 0 ? 'InterBold' : '' }}>{ahead}</p>
      </div>
    </div>
  )
}
export default BattleModeLine
