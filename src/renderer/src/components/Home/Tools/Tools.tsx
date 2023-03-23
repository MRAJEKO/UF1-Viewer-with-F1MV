import { useState } from 'react'

import { connectionStatuses } from '../../../utils/connectionStatuses'
import styles from './Tools.module.css'
import Colors from '../../../assets/Colors.module.css'
import layoutsIcon from '../../../assets/icons/layout.png'
import restoreIcon from '../../../assets/icons/restore.png'
import settingsIcon from '../../../assets/icons/settings.png'

interface ToolsProps {
  openLayouts: () => void
  restoreAll: () => void
  settings: () => void
}

const Tools = ({ openLayouts, restoreAll, settings }: ToolsProps) => {
  const [showRestore, setShowRestore] = useState(false)
  const [showLayouts, setShowLayouts] = useState(true)

  const statuses = connectionStatuses()

  return (
    <section id="tools" className={`${styles.tools} ${Colors['background-tools']}`}>
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
            className={`${styles.button} ${styles['restore-defaults']} ${
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
                  ? `${styles['connected']} ${Colors['connected']}`
                  : `${styles['disconnected']} ${Colors['disconnected']}`
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
            settings
            setShowLayouts(!showLayouts)
            setShowRestore(!showRestore)
          }}
        >
          <img className={styles.icon} src={settingsIcon} />
        </button>
      </div>
    </section>
  )
}

export default Tools
