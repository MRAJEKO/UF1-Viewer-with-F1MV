import styles from './Windows.module.css'
import { liveSession } from '../../../utils/liveSession'

interface LiveTimingWindowProps {
  onPress?: () => void
  name: string
}

const LiveTimingWindow = ({ onPress, name }: LiveTimingWindowProps) => {
  const liveSessionInfo = liveSession()

  const isSessionLive = liveSessionInfo.streamInfo?.liveTimingAvailable

  return (
    <button
      className={`${styles.window} ${styles['default-button']} ${
        !isSessionLive && styles[`disabled`]
      }`}
      onClick={onPress}
    >
      {name}
    </button>
  )
}

export default LiveTimingWindow
