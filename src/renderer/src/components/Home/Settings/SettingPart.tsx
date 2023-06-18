import Setting from './Setting'
import styles from './Settings.module.scss'

interface SettingOptionsProps {
  value: string | number | boolean
  title: string
}

interface SettingPartProps {
  id: string
  name: string
  settings: {
    [key: string]: {
      title: string
      description: string
      type: string
      value: string | number | boolean
      options?: SettingOptionsProps[]
    }
  }
  updateSetting: (category: string, setting: string, value: string | boolean | number) => void
}

const SettingPart = ({ id, name, settings, updateSetting }: SettingPartProps) => {
  return (
    <div className={styles['session-part']} id={id}>
      <h2>{name}</h2>
      <div className="setting-part-settings">
        {Object.keys(settings).map((key) => {
          return (
            <Setting
              updateSetting={(setting, value) => updateSetting(id, setting, value)}
              key={key}
              id={key}
              title={settings[key].title}
              description={settings[key].description}
              type={settings[key].type}
              value={settings[key].value}
              options={settings[key].options}
            />
          )
        })}
      </div>
    </div>
  )
}

export default SettingPart
