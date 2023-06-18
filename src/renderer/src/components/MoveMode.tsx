import { useEffect, useState } from 'react'
import styles from './MoveMode.module.scss'

const MoveMode = () => {
  const [show, setShow] = useState(!(window as any).disableMoveMode)

  useEffect(() => {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        setShow(!show)
      }
    })
  }, [show])

  return show ? (
    <div className={styles.container}>
      <p className={styles.title}>Move Mode Enabled</p>
      <p className={styles.description}>
        Press <span className={styles.key}>Escape</span> to disable
      </p>
    </div>
  ) : null
}

export default MoveMode
