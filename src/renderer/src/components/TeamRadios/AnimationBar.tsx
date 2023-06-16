import { IDriver } from '@renderer/types/LiveTimingStateTypes'
import styles from './TeamRadios.module.css'

interface IProps {
  play: boolean
  duration: number
  isPlaying: boolean
  driverInfo: IDriver
}

const AnimationBar = ({ play, duration, isPlaying, driverInfo }: IProps) => {
  return (
    <div
      className={`${styles.animation} ${isPlaying ? styles.running : ''} ${
        play ? '' : styles.paused
      }`}
      style={{
        animationDuration: `${duration}s`,
        background: driverInfo.TeamColour ? `#${driverInfo.TeamColour}60` : '#A1A1A160'
      }}
    ></div>
  )
}

export default AnimationBar
