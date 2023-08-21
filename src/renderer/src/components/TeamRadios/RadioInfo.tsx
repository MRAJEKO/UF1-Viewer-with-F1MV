import { IDriver } from '@renderer/types/LiveTimingStateTypes'
import styles from './TeamRadios.module.scss'
import { milisecondsToTime } from '@renderer/utils/convertTime'
import { driverHeadshotFallback } from '@renderer/constants/images'

interface IProps {
  driverInfo: IDriver
  utc: string
  gmtOffset: number
  duration?: number
}

const RadioInfo = ({ driverInfo, utc, gmtOffset, duration }: IProps) => {
  const teamColor = driverInfo?.TeamColour ? `#${driverInfo?.TeamColour}` : '#ffffff'
  const { FirstName, LastName, Tla } = driverInfo

  const headshot = driverInfo.HeadshotUrl?.replace('1col', '12col') ?? driverHeadshotFallback

  const name = (
    <div
      className={styles.name}
      style={{
        flexDirection: driverInfo?.NameFormat === 'LastNameIsPrimary' ? 'row-reverse' : 'row'
      }}
    >
      <p>{FirstName ?? ''}</p>
      <p style={{ color: teamColor }}>{LastName?.toUpperCase() ?? Tla}</p>
    </div>
  )

  const durationText = `${Math.floor(Math.round(duration || 0) / 60)}:${(
    Math.round(duration || 0) % 60
  )
    .toString()
    .padStart(2, '0')}`

  return (
    <div className={styles['radio-info']}>
      <div className={styles.headshot}>
        <img src={headshot} alt={`${FirstName} ${LastName}`} />
        <div style={{ background: teamColor }} className={styles.line}></div>
        {name}
      </div>
      <div className={styles.info}>
        {name}
        <div className={styles.times}>
          <p>
            {milisecondsToTime((new Date(utc).getTime() ?? 0) + gmtOffset) ?? ''}
            {' | '}
            {durationText}
          </p>
        </div>
      </div>
    </div>
  )
}

export default RadioInfo
