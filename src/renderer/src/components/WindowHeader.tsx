import styles from './WindowHeader.module.css'

interface Props {
  title: string
}

const WindowHeader = ({ title }: Props) => {
  return (
    <div className={styles.wrapper}>
      <p className={styles.title}>{title}</p>
      <div className={styles.line}></div>
    </div>
  )
}

export default WindowHeader
