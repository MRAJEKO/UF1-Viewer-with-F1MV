import styles from './SessionLog.module.css'

import CardTitleSessionLog from './CardTitleSessionLog'
import CardFooterSessionLog from './CardFooterSessionLog'
import { TrackStatusText } from '@renderer/constants/TrackStatusMappings'

interface Props {
  title: string
  color: string
  time: string
  status: string
  lap?: number
}
const SingleSessionLog = ({ title, color, time, status, lap }: Props) => {
  return (
    <div className={styles.card}>
      <CardTitleSessionLog title={title} />
      <div
        style={{
          backgroundColor: color + 'AA',
          color: 'white',
          fontFamily: 'InterBold',
          textShadow: '.5vw .5vw .5vw black',
          height: '100%',
          display: 'grid',
          placeItems: 'center',
          fontSize: '7vw'
        }}
      >
        {TrackStatusText[status]}
      </div>
      <CardFooterSessionLog time={time} lap={lap} />
    </div>
  )
}

export default SingleSessionLog
