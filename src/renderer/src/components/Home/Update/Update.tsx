import { useEffect, useState } from 'react'
import Loader from '@renderer/components/Loader/Loader'
import Colors from '@renderer/modules/Colors'
import styles from './Update.module.scss'
import Statuses from './Statuses'

const { checkForUpdates } = window.electronUpdater

const Update = () => {
  const [shown, setShown] = useState(true)

  const handleUseApp = () => {
    setShown(false)
  }

  useEffect(() => {
    try {
      checkForUpdates()
    } catch (error) {
      console.error(error)
      setShown(false)
    }

    return () => {}
  }, [])

  console.log(shown)

  return (
    <div className={`${styles.container} ${shown ? '' : styles.hide}`}>
      <div className={styles.loader}>
        {<Loader color={Colors.white} />}
        <Statuses onUseApp={handleUseApp} />
      </div>
      <button className={styles.continue} onClick={() => setShown(false)}>
        CONTINUE ANYWAY
      </button>
    </div>
  )
}
export default Update
