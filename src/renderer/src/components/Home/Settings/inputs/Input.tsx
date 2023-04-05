import styles from './Input.module.css'

interface InputProps {
  id: string
  value: string
  type: string
  updateSetting: (value: string | boolean | number) => void
}

const Input = ({ id, value, type, updateSetting }: InputProps) => {
  return (
    <input
      className={styles.input + ' ' + styles[type]}
      name={id}
      type={type}
      id={id}
      value={value}
      onChange={(event) => updateSetting(event.target.value)}
    />
  )
}

export default Input
