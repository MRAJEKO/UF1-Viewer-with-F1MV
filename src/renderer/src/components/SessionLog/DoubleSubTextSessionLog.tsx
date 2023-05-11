import styles from './SessionLog.module.css'

import CardTitleSessionLog from './CardTitleSessionLog'
import CardFooterSessionLog from './CardFooterSessionLog'
import Colors from '@renderer/modules/Colors'
import { ILiveTimingState } from '@renderer/types/LiveTimingStateTypes'

interface Props {
  title: string
  color1: string
  color2: string
  time: string
  item: string
  message: string
  subMessage: string | null
  highlighted?: boolean
  data: ILiveTimingState
}
const DoubleSubTextSessionLog = ({
  title,
  color1,
  color2,
  time,
  item,
  message,
  subMessage,
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
          {item}
        </div>
        <div
          className={styles['double-card-part']}
          style={{
            backgroundColor: color2,
            borderColor: highlighted ? Colors.highlighted : 'var(--white)'
          }}
        >
          <p>{message}</p>
          {subMessage && <p style={{ fontSize: '5vw', opacity: 0.7 }}>{subMessage}</p>}
        </div>
      </div>
      <CardFooterSessionLog time={time} data={data} />
    </div>
  )
}

export default DoubleSubTextSessionLog
