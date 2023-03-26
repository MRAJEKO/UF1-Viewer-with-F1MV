import { useEffect, useState } from 'react'

import styles from './Connections.module.css'
import { connectionStatuses } from '../../../utils/connectionStatuses'

interface ConnectionProps {
  name: string
  checkType: string
  onTrue: (state: boolean, type: string) => void
}

const Connection = ({ name, checkType, onTrue }: ConnectionProps) => {
  const statuses = connectionStatuses()

  const style = styles[statuses[checkType] ? 'connected' : 'disconnected']

  if (statuses[checkType]) onTrue(true, checkType)

  return (
    <div className={`${styles.connection} ${style}`}>
      <p>
        {name}: <span className={style}>{statuses[checkType] ? 'CONNECTED' : 'DISCONNECTED'}</span>
      </p>
    </div>
  )
}

export default Connection
