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
  play: boolean
  onAudioStop: () => void
  onAudioStart: () => void
  autoplay?: boolean
  animations: boolean
}

const baseUrl = 'https://livetiming.formula1.com/static/'

const TeamRadio = ({
  sessionPath,
  driverInfo,
  utc,
  path,
  gmtOffset = 0,
  play,
  onAudioStop,
  onAudioStart,
  autoplay = false,
  animations
}: IProps) => {
  const [duration, setDuration] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(`${baseUrl}${sessionPath}${path}`)
    audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
    audioRef.current = audio
  }, [])

  const playAudio = () => {
    audioRef?.current?.load()
    audioRef?.current?.play()
    setIsPlaying(true)
    audioRef?.current?.addEventListener('ended', () => {
      setIsPlaying(false)
      onAudioStop()
    })
  }

  useEffect(() => {
    if (autoplay && play && !isPlaying) playAudio()
  }, [autoplay, play])

  if (!audioRef.current) return null

  const handlePress = () => {
    if (play) {
      if (!isPlaying) {
        playAudio()
        onAudioStart()
      } else {
        audioRef?.current?.pause()
        setIsPlaying(false)
        onAudioStop()
      }
    }
  }

  if (isPlaying && !play) audioRef?.current?.pause()
  else if (isPlaying && play) audioRef?.current?.play()

  return (
    <div
      onClick={handlePress}
      className={`${styles.bar} ${isPlaying && animations ? styles.expand : ''}`}
      style={{
        background: `#${driverInfo.TeamColour}50` ?? '#000000'
      }}
    >
      <AnimationBar play={play} driverInfo={driverInfo} duration={duration} isPlaying={isPlaying} />
      <RadioInfo driverInfo={driverInfo} utc={utc} gmtOffset={gmtOffset} duration={duration} />
    </div>
  )
}

export default TeamRadio
