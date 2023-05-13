import styles from './SessionLog.module.css'

import CardTitleSessionLog from './CardTitleSessionLog'
import CardFooterSessionLog from './CardFooterSessionLog'
import { ISessionData, ISessionInfo } from '@renderer/types/LiveTimingStateTypes'

interface IData {
  SessionInfo?: ISessionInfo
  SessionData?: ISessionData
}

interface Props {
  title: string
  color: string
  time: string | null
  message: string
  highlighted?: boolean
  data: IData
}
const SingleCardSessionLog = ({ title, color, time, message, highlighted, data }: Props) => {
  return (
    <div className={styles.card}>
      <CardTitleSessionLog title={title} highlighted={highlighted} />
      <div
        style={{
          backgroundColor: color,
          color: 'white',
          fontFamily: 'InterBold',
          textShadow: '.5vw .5vw .5vw black',
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          fontSize: '7vw'
        }}
      >
        {message}
      </div>
      <CardFooterSessionLog time={time} data={data} />
    </div>
  )
}

export default SingleCardSessionLog
