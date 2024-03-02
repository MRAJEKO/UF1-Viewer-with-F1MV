import styles from '@renderer/components/BattleMode/BattleModeLine.module.scss'
import Colors from '@renderer/modules/Colors'
import { ILiveTimingData } from '@renderer/pages/BattleMode'
import { parseLapOrSectorTime } from '@renderer/utils/convertTime'
import { getTyreIcon } from '@renderer/utils/tyre'

interface IProps {
  driverAhead: string | undefined
  driver: string
  liveTimingData: ILiveTimingData | null
  index: number
}

const BattleModeLine = ({ driverAhead, driver, liveTimingData, index }: IProps) => {
  const { TimingData, DriverList, CarData, TimingAppData, SessionInfo } = liveTimingData || {}

  const driverAheadTimingData = driverAhead ? TimingData?.Lines?.[driverAhead] : null
  const driverAheadGapToLeader = driverAheadTimingData?.GapToLeader

  const driverTimingData = TimingData?.Lines?.[driver]

  const driverTimingAppData = TimingAppData?.Lines?.[driver]

  const driverCarData = CarData?.Entries[0]?.Cars?.[driver]

  const ahead = (() => {
    const driverGapToLeader = driverTimingData?.GapToLeader

    if (SessionInfo?.Type === 'Qualifying') {
      if (index === 0) return driverTimingData?.BestLapTime?.Value || ''

      const driverAheadBestLapTime = parseLapOrSectorTime(driverAheadTimingData?.BestLapTime?.Value)
      const driverBestLapTime = parseLapOrSectorTime(driverTimingData?.BestLapTime?.Value)

      if (!driverAheadBestLapTime || !driverBestLapTime) return ''

      const gap = driverBestLapTime - driverAheadBestLapTime

      console.log(gap)

      if (gap > 0) return `+${gap.toFixed(3)}`

      return gap.toFixed(3)
    }

    if (index === 0) return 'INTERVAL'

    if (driverAheadGapToLeader?.includes('LAP')) return driverGapToLeader

    if (!driverAheadGapToLeader || !driverGapToLeader) return ''

    const gap = parseFloat(driverGapToLeader) - parseFloat(driverAheadGapToLeader)

    if (gap > 0) return `+${gap.toFixed(3)}`

    return gap.toFixed(3)
  })()

  const driverInfo = DriverList?.[driver]

  const position = driverTimingData?.Position

  const drsStatus = driverCarData?.Channels[45]

  const drsOn = drsStatus === 10 || drsStatus === 12 || drsStatus === 14

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
      <div className={styles.drs}>
        <p
          style={{
            opacity: drsOn ? '100%' : '30%',
            color: Colors.green,
            borderColor: Colors.green
          }}
        >
          DRS
        </p>
      </div>
      <div className={styles.lap}>
        <p>{driverTimingData?.LastLapTime?.Value}</p>
      </div>
    </div>
  )
}
export default BattleModeLine
