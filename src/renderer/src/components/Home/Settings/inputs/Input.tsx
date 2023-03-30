import styles from './Input.module.css'

interface InputProps {
  id: string
  value: string
  updateSetting: (category: string, setting: string, value: string | boolean | number) => void
}

const Input = ({ id, value, updateSetting }: InputProps) => {
  return (
    <input
      className={styles.input}
      name="highlighted_drivers"
      type="text"
      id="highlighted_drivers"
      onChange={(event) => updateSetting('Hello', 'world', event.target.value)}
    />
  )
}

export default Input
