import styles from './InfoBar.module.scss'

interface IInfoBarProps {
  text: string
}

const InfoBar = ({ text }: IInfoBarProps) => {
  return <p className={styles.info}>{text}</p>
}

export default InfoBar
