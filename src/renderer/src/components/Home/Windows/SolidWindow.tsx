import styles from './SolidWindows.module.css'

interface SolidWindowProps {
  onPress: () => void
  color: string
}

const SolidWindow = ({ onPress, color }: SolidWindowProps) => {
  return (
    <button
      className={styles['solid-window']}
      style={{ backgroundColor: color }}
      onClick={onPress}
    ></button>
  )
}

export default SolidWindow
