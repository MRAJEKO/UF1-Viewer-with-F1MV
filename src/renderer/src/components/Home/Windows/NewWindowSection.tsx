import styles from './Windows.module.scss'

interface Props {
  name: string
}

const NewWindowSection = ({ name }: Props) => {
  return (
    <div className={styles['new-window-section']}>
      <div className={styles.line}></div>
      <p>{name}</p>
      <div className={styles.line}></div>
    </div>
  )
}

export default NewWindowSection
