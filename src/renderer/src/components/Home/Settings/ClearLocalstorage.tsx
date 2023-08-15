import { useState } from 'react'
import styles from './Settings.module.scss'

const ClearLocalstorage = () => {
  const [message, setMessage] = useState('Clear Localstorage')

  const handleClick = () => {
    localStorage.clear()
    setMessage('Localstorage Cleared')

    setTimeout(() => {
      setMessage('Clear Localstorage')
    }, 2000)
  }

  return (
    <button className={styles['clear-localstorage']} onClick={handleClick}>
      {message}
    </button>
  )
}
export default ClearLocalstorage
