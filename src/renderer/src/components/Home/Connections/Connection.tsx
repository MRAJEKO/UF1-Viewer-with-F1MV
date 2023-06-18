import styles from './Connections.module.scss'
import { connectionStatuses } from '../../../hooks/useConnectionStatuses'

interface ConnectionProps {
  name: string
  checkType: string
}

const Connection = ({ name, checkType }: ConnectionProps) => {
  const statuses = connectionStatuses()

  const style = styles[statuses[checkType] ? 'connected' : 'disconnected']

  return (
    <div className={`${styles.connection} ${style}`}>
      <p>
        {name}: <span className={style}>{statuses[checkType] ? 'CONNECTED' : 'DISCONNECTED'}</span>
      </p>
    </div>
  )
}

export default Connection
