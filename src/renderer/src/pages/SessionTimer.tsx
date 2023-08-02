import styles from '@renderer/components/TrackTime/TrackTime.module.scss'
import useSessionTimer from '@renderer/hooks/useSessionTimer'
import Colors from '@renderer/modules/Colors'

const SessionTimer = () => {
  const { sessionTime, extraPolating } = useSessionTimer()

  return (
    <div className={styles.container}>
      <div style={{ color: extraPolating ? null : Colors.gray }}>{sessionTime}</div>
    </div>
  )
}

export default SessionTimer
