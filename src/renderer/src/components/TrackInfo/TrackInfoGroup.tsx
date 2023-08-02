import React from 'react'
import styles from './TrackInfo.module.scss'

interface ITrackInfoGroupProps {
  children?: React.ReactNode
}

const TrackInfoGroup = ({ children }: ITrackInfoGroupProps) => {
  return <div className={styles.group}>{children}</div>
}

export default TrackInfoGroup
