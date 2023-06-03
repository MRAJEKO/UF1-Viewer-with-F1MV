import styles from './TeamRadios.module.css'

interface IProps {
  duration: number
  isPlaying: boolean
}

const AnimationBar = ({ duration, isPlaying }: IProps) => {
  return (
    <div
      className={`${styles.animation} ${isPlaying ? styles.running : ''}`}
      style={{ animationDuration: `${duration}s` }}
    ></div>
  )
}

export default AnimationBar
