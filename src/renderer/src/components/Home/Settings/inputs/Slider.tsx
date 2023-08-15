import styles from './Slider.module.scss'

interface SelectProps {
  id: string
  value: number
  updateSetting: (value: number) => void
}

const Slider = ({ id, value, updateSetting }: SelectProps) => {
  return (
    <div className={styles.container}>
      <p>{value}%</p>
      <input
        type="range"
        min="0"
        max="100"
        step="1"
        className={styles.slider}
        name={id}
        id={id}
        value={value}
        onChange={(event) => updateSetting(parseInt(event.target.value))}
      ></input>
    </div>
  )
}

export default Slider
