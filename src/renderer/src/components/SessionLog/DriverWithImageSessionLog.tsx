import styles from './SessionLog.module.scss'

import CardTitleSessionLog from './CardTitleSessionLog'
import CardFooterSessionLog from './CardFooterSessionLog'

interface Props {
  title: string
  color: string
  time: string
  message: string
  lap?: number
  qualifyingPart?: number
}
const SingleCardSessionLog = ({ title, color, time, message, lap, qualifyingPart }: Props) => {
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
        {message}
      </div>
      <CardFooterSessionLog time={time} lap={lap} qualifyingPart={qualifyingPart} />
    </div>
  )
}

export default SingleCardSessionLog
