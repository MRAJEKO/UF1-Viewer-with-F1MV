import { segmentsStatusColorMappings } from '@renderer/constants/segmentStatusColorMappings'
import Colors from '@renderer/modules/Colors'
import { ISector, ITimingStatsLine } from '@renderer/types/LiveTimingStateTypes'
import styles from './PushLapCardSector.module.scss'

interface IPushLapCardSectorProps {
  lapCompleted: boolean
  isPushing: boolean
  sectorInfo: ISector
  firstSectorCompleted: boolean
  targetTimingStats?: ITimingStatsLine
  index: number
}

const PushLapCardSector = ({
  lapCompleted,
  isPushing,
  sectorInfo,
  firstSectorCompleted,
  targetTimingStats,
  index
}: IPushLapCardSectorProps) => {
  if (!sectorInfo) return null

  const { Value, Segments, OverallFastest, PersonalFastest } = sectorInfo

  const targetTime = !!targetTimingStats?.BestSectors?.[index]?.Value

  const delta = targetTime
    ? (
        parseFloat(Value) - parseFloat(targetTimingStats?.BestSectors?.[index]?.Value || '0')
      ).toFixed(3)
    : ''

  const isPositive = targetTime ? parseFloat(delta) > 0 : false

  return (
    <div className={styles.sector}>
      <div className={styles.top}>
        <p
          style={{
            color:
              (firstSectorCompleted || (!isPushing && lapCompleted)) && Value !== ''
                ? OverallFastest
                  ? Colors.purple
                  : PersonalFastest
                  ? Colors.green
                  : Colors.yellow
                : Colors.darkgray
          }}
          className={styles.time}
        >
          {(firstSectorCompleted || (!isPushing && lapCompleted)) && Value !== ''
            ? Value ?? 'NO TIME'
            : 'NO TIME'}
        </p>
        <p style={{ color: isPositive ? Colors.yellow : Colors.green }} className={styles.delta}>
          {(firstSectorCompleted || (!isPushing && lapCompleted)) && Value !== ''
            ? isPositive
              ? `+${delta}`
              : delta
            : ''}
        </p>
      </div>
      {Segments && (
        <div className={styles.segments}>
          {Segments.map((segment, index) => (
            <div
              key={index}
              style={{
                backgroundColor: segmentsStatusColorMappings[segment.Status] ?? Colors.darkgray
              }}
              className={styles.segment}
            ></div>
          ))}
        </div>
      )}
    </div>
  )
}
export default PushLapCardSector
