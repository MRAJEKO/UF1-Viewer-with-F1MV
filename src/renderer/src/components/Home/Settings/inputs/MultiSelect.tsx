import Select from './Select'
import styles from './MultiSelect.module.scss'

interface IProps {
  id: string
  value: (string | null)[]
  options:
    | {
        value: string | number | boolean
        title: string
      }[][]
    | {
        value: string | number | boolean
        title: string
      }[]
  updateSetting: (value: any) => void
}

const MultiSelect = ({ id, value, options, updateSetting }: IProps) => {
  console.log(value)

  const modifySetting = (newValue: string, index: number) => {
    const updatedValue = [...value]
    updatedValue[index] = newValue === '' ? null : newValue
    updateSetting(updatedValue)
  }

  return (
    <div className={styles.container}>
      {options.map((option, index) => (
        <Select
          key={index}
          id={id}
          value={value[index] || ''}
          options={option}
          updateSetting={(newValue) => modifySetting(newValue, index)}
        />
      ))}
    </div>
  )
}

export default MultiSelect
