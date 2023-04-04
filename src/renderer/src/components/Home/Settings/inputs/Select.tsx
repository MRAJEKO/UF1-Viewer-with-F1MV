import styles from './Select.module.css'

interface SelectProps {
  id: string
  value: string
  options: {
    value: string | number | boolean
    title: string
  }[]
  updateSetting: (category: string, setting: string, value: string | boolean | number) => void
}

const Select = ({ id, value, options, updateSetting }: SelectProps) => {
  return (
    <select
      className={styles.select}
      name={id}
      id={id}
      value={value}
      onChange={(event) => updateSetting('Hello', 'world', event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value.toString()} value={option.value.toString()}>
          {option.title}
        </option>
      ))}
    </select>
  )
}

export default Select
