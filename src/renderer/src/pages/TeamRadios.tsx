import MoveMode from '@renderer/components/MoveMode'
import TeamRadio from '@renderer/components/TeamRadios/TeamRadio'
import styles from '@renderer/components/TeamRadios/TeamRadios.module.css'
import useLiveTiming from '@renderer/hooks/useLiveTiming'
import {
  IDriverList,
  ISessionInfo,
  ITeamRadio,
  ITeamRadioCapture
} from '@renderer/types/LiveTimingStateTypes'
import { timeToMiliseconds, timezoneToMiliseconds } from '@renderer/utils/convertTime'
import { useEffect, useState } from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import StatusButton from '../components/TeamRadios/StatusButton'

interface IStateData {
  SessionInfo: ISessionInfo
  TeamRadio: ITeamRadio
  DriverList: IDriverList
}

interface IButtonStatuses {
  autoplay: boolean
  play: boolean
}

const TeamRadios = () => {
  const [driverList, setDriverList] = useState<IDriverList>({})

  const [sessionInfo, setSessionInfo] = useState<ISessionInfo | null>(null)

  const [teamRadios, setTeamRadios] = useState<ITeamRadioCapture[]>([])

  const [buttonStatuses, setButtonStatuses] = useState<IButtonStatuses>({
    autoplay:
      window.ipcRenderer.sendSync('get-store', 'config')?.teamradios?.settings?.autoplay.value ??
      false,
    play: true
  })

  const [audioPlaying, setAutoPlaying] = useState<boolean>(false)

  const [queue, setQueue] = useState<ITeamRadioCapture[]>([])

  const minimizeAnimations =
    window.ipcRenderer.sendSync('get-store', 'config')?.teamradios?.settings?.minimize_animations
      ?.value ?? false

  console.log(buttonStatuses)

  const handleDataReceived = (stateData: IStateData, firstPatch: boolean) => {
    const dataTeamRadios = stateData?.TeamRadio?.Captures || []

    if (JSON.stringify(sessionInfo) !== JSON.stringify(stateData?.SessionInfo))
      setSessionInfo(stateData?.SessionInfo)

    if (JSON.stringify(stateData.DriverList) !== JSON.stringify(driverList))
      setDriverList(stateData.DriverList)

    if (teamRadios.length !== dataTeamRadios.length) {
      const newTeamRadios = dataTeamRadios.filter(
        (radio) => !teamRadios.find((oldRadio) => oldRadio.Path === radio.Path)
      )

      if (newTeamRadios.length > 0 && !firstPatch) {
        setQueue(
          [...queue, ...newTeamRadios].sort(
            (a, b) => timezoneToMiliseconds(a.Utc) - timezoneToMiliseconds(b.Utc)
          )
        )
      }

      setTeamRadios([
        ...dataTeamRadios.sort(
          (a, b) => timezoneToMiliseconds(b.Utc) - timezoneToMiliseconds(a.Utc)
        )
      ])
    }
  }

  useLiveTiming(['TeamRadio', 'DriverList', 'SessionInfo'], handleDataReceived, 500)

  useEffect(() => {
    window.ipcRenderer.send('initialize-keybind', 'CommandOrControl+Shift+T')

    window.addEventListener('beforeunload', () => {
      window.ipcRenderer.send('remove-keybind', 'CommandOrControl+Shift+T')
    })
  }, [])

  useEffect(() => {
    window.ipcRenderer.on('keybind-pressed', () => {
      setButtonStatuses({ ...buttonStatuses, play: !buttonStatuses.play })
    })
  }, [buttonStatuses])

  console.log(teamRadios)

  const handleAudioStop = () => {
    setAutoPlaying(false)
    console.log('audio stopped')
    console.log(buttonStatuses.autoplay)
    if (buttonStatuses.autoplay) {
      setQueue((prevQueue) => prevQueue.slice(1))
    }
  }

  useEffect(() => {
    if (!buttonStatuses.autoplay && queue.length > 0) setQueue([])

    if (buttonStatuses.play && !audioPlaying && queue.length > 0) {
      console.log('play')
      setAutoPlaying(true)
    }
  }, [buttonStatuses.autoplay, buttonStatuses.play])

  console.log(queue)

  return (
    <>
      <div className={styles.container}>
        <MoveMode />
        <TransitionGroup>
          {teamRadios.map((radio) => (
            <CSSTransition
              key={radio.Path}
              timeout={500}
              classNames={{
                enter: styles['radio-wrapper-enter'],
                exitActive: styles['radio-wrapper-exit-active']
              }}
            >
              <div className={styles['bar-wrapper']}>
                <TeamRadio
                  sessionPath={sessionInfo?.Path}
                  path={radio.Path}
                  driverInfo={driverList[radio.RacingNumber]}
                  utc={radio.Utc}
                  gmtOffset={timeToMiliseconds(sessionInfo?.GmtOffset)}
                  play={buttonStatuses.play}
                  onAudioStop={handleAudioStop}
                  onAudioStart={() => setAutoPlaying(true)}
                  autoplay={
                    !audioPlaying &&
                    buttonStatuses.autoplay &&
                    JSON.stringify(queue[0]) === JSON.stringify(radio)
                  }
                  animations={!minimizeAnimations}
                />
              </div>
            </CSSTransition>
          ))}
        </TransitionGroup>
      </div>
      <div className={styles.footer}>
        <StatusButton
          name="Play"
          enabled={buttonStatuses.play}
          setEnabled={(status) => setButtonStatuses({ ...buttonStatuses, play: status })}
        />
        <StatusButton
          name="Autoplay"
          enabled={buttonStatuses.autoplay}
          setEnabled={(status) => setButtonStatuses({ ...buttonStatuses, autoplay: status })}
        />
      </div>
    </>
  )
}

export default TeamRadios
