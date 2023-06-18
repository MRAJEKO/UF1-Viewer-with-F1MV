import styles from './Timer.module.scss'

interface Props {
  timer: string | null
}

const Timer = ({ timer }: Props) => {
  timer = timer ?? '?:??:??:??'

  const mapping = ['DAYS', 'HOURS', 'MINUTES', 'SECONDS']

  return (
    <div className={styles.container}>
      {timer.split(':').map((number, index) => (
        <div className={styles['counter-container']} key={index}>
          <div className={styles.counter}>
            <p>{number}</p>
          </div>
          <div className={styles['counter-name']}>
            <p>{mapping[index]}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Timer
