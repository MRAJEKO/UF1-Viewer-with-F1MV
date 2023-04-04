import styles from './Input.module.css'

interface InputProps {
  id: string
  value: string
  type: string
  updateSetting: (category: string, setting: string, value: string | boolean | number) => void
}

const Input = ({ id, value, type, updateSetting }: InputProps) => {
  return (
    <input
      className={styles.input}
      name={id}
      type={type}
      id={id}
      value={value}
      onChange={(event) => updateSetting('Hello', 'world', event.target.value)}
    />
  )
}

export default Input
