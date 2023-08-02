import styles from '@renderer/components/TrackTime/TrackTime.module.scss'
import useTrackTime from '@renderer/hooks/useTrackTime'

const TrackTime = () => {
  const { trackTime } = useTrackTime()

  return (
    <div className={styles.container}>
      <div>{trackTime}</div>
    </div>
  )
}

export default TrackTime
