import Colors from '@renderer/modules/Colors'
import styles from './PushLapCardSector.module.scss'
import { ISector } from '@renderer/types/LiveTimingStateTypes'
import { segmentsStatusColorMappings } from '@renderer/constants/segmentStatusColorMappings'

interface IPushLapCardSectorProps {
  sectorInfo: ISector
  firstSectorCompleted: boolean
}

const PushLapCardSector = ({ sectorInfo, firstSectorCompleted }: IPushLapCardSectorProps) => {
  if (!sectorInfo) return null

  const { Value, Segments, OverallFastest, PersonalFastest } = sectorInfo

  return (
    <div className={styles.sector}>
      <div className={styles.top}>
        <p
          style={{
            color: firstSectorCompleted
              ? OverallFastest
                ? Colors.purple
                : PersonalFastest
                ? Colors.green
                : Value !== ''
                ? Colors.yellow ?? Colors.darkgray
                : Colors.darkgray
              : Colors.darkgray
          }}
          className={styles.time}
        >
          {firstSectorCompleted && Value !== '' ? Value ?? 'NO TIME' : 'NO TIME'}
        </p>
        <p style={{ color: Colors.yellow }} className={styles.delta}>
          {firstSectorCompleted && Value !== '' ? '+DEL' : ''}
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
