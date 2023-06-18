import styles from './Select.module.scss'

interface SelectProps {
  id: string
  value: string
  options:
    | {
        value: any
        title: string
      }[]
    | {
        value: any
        title: string
      }[][]
  updateSetting: (value: any) => void
}

const Select = ({ id, value, options, updateSetting }: SelectProps) => {
  return (
    <select
      className={styles.select}
      name={id}
      id={id}
      value={value}
      onChange={(event) => updateSetting(event.target.value)}
    >
      {options.map((option) => (
        <option key={option?.value?.toString() ?? ''} value={option?.value?.toString() ?? ''}>
          {option.title}
        </option>
      ))}
    </select>
  )
}

export default Select
