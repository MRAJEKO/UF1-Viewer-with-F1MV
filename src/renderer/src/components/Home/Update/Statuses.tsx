import { useState, useEffect } from 'react'
import styles from './Update.module.scss'

const { ipcRenderer } = window

interface IStatusProps {
  onUseApp: () => void
}

const Statuses = ({ onUseApp }: IStatusProps) => {
  const [progress, setProgress] = useState<number>(0)

  const handleUpdateAvailable = () => {
    setProgress(1)
  }

  const handleUpdateDownloaded = () => {
    setProgress(2)
  }

  const handleUpdateNotAvailable = () => {
    setProgress(3)
    setTimeout(() => {
      onUseApp()
    }, 3000)
  }

  useEffect(() => {
    ipcRenderer.on('update-available', handleUpdateAvailable)

    ipcRenderer.on('update-downloaded', handleUpdateDownloaded)

    ipcRenderer.on('update-not-available', handleUpdateNotAvailable)

    ipcRenderer.on('error', handleUpdateNotAvailable())

    return () => {
      ipcRenderer.off('update-available', handleUpdateAvailable)

      ipcRenderer.off('update-downloaded', handleUpdateDownloaded)

      ipcRenderer.off('update-not-available', handleUpdateNotAvailable)

      ipcRenderer.off('error', handleUpdateNotAvailable)
    }
  }, [])

  return (
    <div className={styles.statuses}>
      <p className={progress === 0 ? styles.active : ''}>Checking for updates</p>
      <p className={progress === 1 ? styles.active : ''}>Downloading update</p>
      <p className={progress === 2 ? styles.active : ''}>Installing Update</p>
      <p className={progress === 3 ? styles.active : ''}>Use Ultimate Formula 1 Viewer!</p>
    </div>
  )
}
export default Statuses
