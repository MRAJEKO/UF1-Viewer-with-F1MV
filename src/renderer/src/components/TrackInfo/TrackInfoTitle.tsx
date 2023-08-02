import styles from './TrackInfo.module.scss'

interface ITrackInfoTitleProps {
  title: string
}

const TrackInfoTitle = ({ title }: ITrackInfoTitleProps) => {
  return <p className={styles.title}>{title}</p>
}

export default TrackInfoTitle
