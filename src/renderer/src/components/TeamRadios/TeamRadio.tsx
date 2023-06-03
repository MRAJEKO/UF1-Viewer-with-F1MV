import { IDriver } from '@renderer/types/LiveTimingStateTypes'
import { useEffect, useRef, useState } from 'react'
import styles from './TeamRadios.module.css'
import AnimationBar from './AnimationBar'
import RadioInfo from './RadioInfo'

interface IProps {
  sessionPath: string | undefined
  driverInfo: IDriver
  utc: string
  path: string
  gmtOffset?: number
}

const baseUrl = 'https://livetiming.formula1.com/static/'

const TeamRadio = ({ sessionPath, driverInfo, utc, path, gmtOffset = 0 }: IProps) => {
  const [duration, setDuration] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(`${baseUrl}${sessionPath}${path}`)
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
    audioRef.current = audio
  }, [])

  if (!audioRef.current) return null

  const handlePress = () => {
    if (!isPlaying) {
      audioRef?.current?.load()
      audioRef?.current?.play()
      setIsPlaying(true)
      audioRef?.current?.addEventListener('ended', () => setIsPlaying(false))
    } else {
      audioRef?.current?.pause()
      setIsPlaying(false)
    }
  }

  return (
    <div onClick={handlePress} className={styles.bar}>
      <AnimationBar duration={duration} isPlaying={isPlaying} />
      <RadioInfo driverInfo={driverInfo} utc={utc} gmtOffset={gmtOffset} duration={duration} />
    </div>
  )
}

export default TeamRadio
