import { useState, useEffect } from 'react'
import SettingPart from './SettingPart'
import styles from './Settings.module.css'
import windowsStyles from '../Windows/Windows.module.css'

interface SettingsProps {
  extended?: boolean
}

const Settings = ({ extended }: SettingsProps) => {
  const [settings, setSettings] = useState<any>(null)

  useEffect(() => {
    if (settings) return

    setSettings(window.ipcRenderer.sendSync('get-store', 'config') ?? null)
  }, [])

  if (!settings) return <h1>Loading settings...</h1>

  function updateSetting(category: string, setting: string, value: string | boolean | number) {
    if (!settings) return
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        settings: {
          ...settings[category].settings,
          [setting]: { ...settings[category].settings[setting], value: value }
        }
      }
    })
  }

  if (!extended) window.ipcRenderer.invoke('set-config', settings)

  return (
    <section
      className={`${styles.settings} ${extended && styles.extended} ${
        windowsStyles['homepage-section']
      }`}
    >
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
