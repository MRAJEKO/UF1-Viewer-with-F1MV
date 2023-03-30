import { useState, useEffect } from 'react'
import SettingPart from './SettingPart'
import styles from './Settings.module.css'

interface SettingsProps {
  extended?: boolean
}

const Settings = ({ extended }: SettingsProps) => {
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    window.ipcRenderer.invoke('get-store').then((data) => {
      setSettings(data.config)
    })
  }, [])

  if (!settings) return <h1>Loading settings...</h1>

  function updateSetting(category: string, setting: string, value: string | boolean | number) {
    console.log(category, setting, value)
  }

  return (
    <section className={`${styles.settings} ${extended && styles.extended}`}>
      <div className={styles.container}>
        {Object.keys(settings).map((key) => {
          return (
            <SettingPart
              updateSetting={updateSetting}
              key={key}
              id={key}
              name={settings[key].name}
              settings={settings[key].settings}
            />
          )
        })}
      </div>
    </section>
  )
}

export default Settings
