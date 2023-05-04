import styles from './Info.module.css'

interface Props {
  flag: string | null
  nextEventInfo: any
  nextSessionName: string
}

const Info = ({ flag, nextEventInfo, nextSessionName }: Props) => {
  const mapSessionName = {
    FirstPractice: 'Free Practice 1',
    SecondPractice: 'Free Practice 2',
    ThirdPractice: 'Free Practice 3'
  }

  nextSessionName = mapSessionName[nextSessionName] ?? nextSessionName

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        {flag && (
          <div
            style={{ backgroundImage: `url(${flag})` }}
            className={styles['flag-container']}
          ></div>
        )}
        <div className={styles['info-container']}>
          <p className={styles['session-name']}>{nextSessionName}</p>
          <p className={styles['event-name']}>{nextEventInfo.raceName}</p>
        </div>
      </div>
    </div>
  )
}

export default Info
