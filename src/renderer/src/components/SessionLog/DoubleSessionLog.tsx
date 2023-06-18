import styles from './SessionLog.module.scss'

import CardTitleSessionLog from './CardTitleSessionLog'
import CardFooterSessionLog from './CardFooterSessionLog'
import Colors from '@renderer/modules/Colors'
import { ISessionData, ISessionInfo } from '@renderer/types/LiveTimingStateTypes'

interface Props {
  title: string
  color1: string
  color2: string
  time: string | number
  left: string
  right: string
  subInfo?: string | null
  highlighted?: boolean
  data: {
    SessionInfo?: ISessionInfo
    SessionData?: ISessionData
  }
}
const DoubleSessionLog = ({
  title,
  color1,
  color2,
  time,
  left,
  right,
  subInfo,
  highlighted,
  data
}: Props) => {
  return (
    <div className={styles.card}>
      <CardTitleSessionLog title={title} highlighted={highlighted} />
      <div className={styles['double-card']}>
        <div
          className={styles['double-card-part']}
          style={{
            backgroundColor: color1,
            borderColor: highlighted ? Colors.highlighted : 'var(--white)'
          }}
        >
          {left}
        </div>
        <div
          className={styles['double-card-part']}
          style={{
            backgroundColor: color2,
            borderColor: highlighted ? Colors.highlighted : 'var(--white)'
          }}
        >
          <p>{right}</p>
          {subInfo && <p style={{ fontSize: '5vw', opacity: 0.7 }}>{subInfo}</p>}
        </div>
      </div>
      <CardFooterSessionLog time={time} data={data} />
    </div>
  )
}

export default DoubleSessionLog
