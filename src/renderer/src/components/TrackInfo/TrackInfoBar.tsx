import { contrastColor } from '@renderer/utils/textColor'
import styles from './TrackInfo.module.scss'

interface ITrackInfoBarProps {
  textColor?: string
  color: string
  text: string
}

const TrackInfoBar = ({ textColor, color, text }: ITrackInfoBarProps) => {
  console.log(textColor ?? contrastColor(color ?? '#ffffff'))

  return (
    <div className={styles.bar} style={{ background: color ?? '#ffffff' }}>
      <p style={{ color: textColor ?? contrastColor(color ?? '#ffffff') }}>{text ?? 'UNKNOWN'}</p>
    </div>
  )
}

export default TrackInfoBar
