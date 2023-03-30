import styles from './Settings.module.css'
import Switch from './inputs/Switch'
import Input from './inputs/Input'

interface SettingProps {
  id: string
  title: string
  description: string
  type: string
  value: string | number | boolean
  options?: {
    value: string | number | boolean
    title: string
  }[]
  updateSetting: (category: string, setting: string, value: string | boolean | number) => void
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
          <Switch updateSetting={updateSetting} id={id} value={Boolean(value)} />
        )}
        {type === 'text' && (
          <Input updateSetting={updateSetting} id={id} value={value.toString()} />
        )}
      </div>
    </div>
  )
}

export default Setting
