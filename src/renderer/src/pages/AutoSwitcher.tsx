import MoveMode from '@renderer/components/MoveMode'
import useAutoSwitcher from '@renderer/components/AutoSwitcher/useAutoSwitcher'
import styles from '@renderer/components/AutoSwitcher/AutoSwitcher.module.scss'
import { useEffect, useState } from 'react'

export interface IList {
  drivers: string[]
  lap: number
}

const AutoSwitcher = () => {
  const [hidden, setHidden] = useState<boolean>(false)

  const { mainWindowName, obcCount } = useAutoSwitcher()

  const handleHide = () => {
    setHidden(true)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setHidden(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <MoveMode />
      {!hidden && (
        <div className={styles.container}>
          <div className={styles['main-window']}>
            <p className={styles.title}>Main Window</p>
            <p className={styles.number}>{mainWindowName ?? 'Unknown'}</p>
          </div>
          <div className={styles.onboards}>
            <p className={styles.title}>Onboards found:</p>
            <p className={styles.number}>{obcCount}</p>
          </div>
          <div className={styles.buttons}>
            <div onClick={handleHide} className={styles.hide}>
              <p>Hide</p>
            </div>
          </div>
          <div className={styles.disclaimer}>
            <p>
              This window must always stay on top. If the window is hidden, it will be transparent.
              Pressing <span className={styles.highlight}>Escape</span> will remove the hiding
              effect
            </p>
          </div>
        </div>
      )}
    </>
  )
}
export default AutoSwitcher
