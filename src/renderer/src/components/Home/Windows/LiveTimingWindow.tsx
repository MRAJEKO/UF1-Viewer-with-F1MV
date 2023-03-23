import styles from './Windows.module.css'
import Colors from '../../../assets/Colors.module.css'
import { liveSession } from '../../../utils/liveSession'

interface LiveTimingWindowProps {
  onPress?: () => void
  name: string
}

const LiveTimingWindow = ({ onPress, name }: LiveTimingWindowProps) => {
  const liveSessionInfo = liveSession()

  const isSessionLive = liveSessionInfo.liveSessionFound

  console.log(isSessionLive)

  return (
    <button
      className={`${styles.window} ${Colors['default-button']} ${
        !isSessionLive && Colors[`disabled`]
      }`}
      onClick={onPress}
    >
      {name}
    </button>
  )
}

export default LiveTimingWindow
