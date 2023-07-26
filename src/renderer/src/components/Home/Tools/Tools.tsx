import { useState } from 'react'

import { connectionStatuses } from '../../../hooks/useConnectionStatuses'
import styles from './Tools.module.scss'
import layoutsIcon from '../../../assets/icons/layout.png'
import restoreIcon from '../../../assets/icons/restore.png'
import settingsIcon from '../../../assets/icons/settings.png'
import windowsStyles from '../Windows/Windows.module.scss'

interface ToolsProps {
  shown: boolean
  openLayouts: () => void
  restoreAll: () => void
  settings: () => void
}

const Tools = ({ shown, openLayouts, restoreAll, settings }: ToolsProps) => {
  const [showRestore, setShowRestore] = useState(false)
  const [showLayouts, setShowLayouts] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  const statuses = connectionStatuses()

  return (
    <section
      id="tools"
      className={`${styles.tools} ${styles['background-tools']} ${windowsStyles['homepage-section']}`}
      style={{ height: shown ? '' : '0px', bottom: shown ? '' : '0px' }}
    >
      <div className={styles['tools-wrapper']}>
        <div className={`${styles['icon']} ${styles['dynamic-button']}`}>
          <div
            title="Layouts"
            className={`${styles.button} ${styles['layout-button']} ${
              !showLayouts && styles.hidden
            }`}
            onClick={openLayouts}
          >
            <img className={styles.icon} src={layoutsIcon} />
          </div>
          <button
            title="Restore Default Settings"
            className={`${styles.button} ${styles['reset-defaults']} ${
              !showRestore && styles.hidden
            }`}
            onClick={restoreAll}
          >
            <img className={styles.icon} src={restoreIcon} />
          </button>
        </div>
        <div className={styles['connection-status']}>
          <p>
            Live Timing Status:{' '}
            <span
              id="connection"
              className={
                statuses.liveTiming
                  ? `${styles['connected']} ${styles['connected']}`
                  : `${styles['disconnected']} ${styles['disconnected']}`
              }
            >
              {statuses.liveTiming ? 'CONNECTED' : 'DISCONNECTED'}
            </span>
          </p>
        </div>
        <button
          title="Settings"
          id="options"
          className={styles.button}
          onClick={() => {
            settings()
            setShowLayouts(!showLayouts)
            setShowRestore(!showRestore)
            setShowSettings(!showSettings)
          }}
        >
          <img className={`${styles.icon} ${showSettings && styles.rotated}`} src={settingsIcon} />
        </button>
      </div>
    </section>
  )
}

export default Tools
