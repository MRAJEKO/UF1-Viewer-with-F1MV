import styles from './Switch.module.scss'

interface SwitchProps {
  id: string
  value: boolean
  updateSetting: (value: string | boolean | number) => void
}

const Switch = ({ id, value, updateSetting }: SwitchProps) => {
  return (
    <label className={styles.switch}>
      <input onChange={() => updateSetting(!value)} type="checkbox" id={id} checked={value} />
      <span className={styles.slider}></span>
    </label>
  )
}

export default Switch
