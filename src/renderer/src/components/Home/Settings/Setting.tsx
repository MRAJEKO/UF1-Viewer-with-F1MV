import styles from './Settings.module.css'
import Switch from './inputs/Switch'
import Input from './inputs/Input'
import Select from './inputs/Select'
import MultiSelect from './inputs/MultiSelect'

interface SettingProps {
  id: string
  title: string
  description: string
  type: string
  value: any
  options?:
    | {
        value: any
        title: string
      }[]
    | {
        value: any
        title: string
      }[][]
  updateSetting: (setting: string, value: string | boolean | number) => void
}

const Setting = ({ id, title, description, type, value, options, updateSetting }: SettingProps) => {
  return (
    <div className={styles.setting}>
      <div className={styles['setting-header']}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <div className={styles['setting-body']}>
        {type === 'switch' && (
          <Switch
            updateSetting={(value) => updateSetting(id, value)}
            id={id}
            value={Boolean(value)}
          />
        )}
        {type === 'text' && (
          <Input
            type={type}
            updateSetting={(value) => updateSetting(id, value)}
            id={id}
            value={value.toString()}
          />
        )}
        {type === 'number' && (
          <Input
            type={type}
            updateSetting={(value) => updateSetting(id, value)}
            id={id}
            value={value.toString()}
          />
        )}
        {type === 'select' && (
          <Select
            updateSetting={(value) => updateSetting(id, value)}
            id={id}
            value={value.toString()}
            options={options ?? []}
          />
        )}
        {type === 'multiselect' && (
          <MultiSelect
            updateSetting={(value) => updateSetting(id, value)}
            id={id}
            value={value}
            options={options ?? []}
          />
        )}
      </div>
    </div>
  )
}

export default Setting
