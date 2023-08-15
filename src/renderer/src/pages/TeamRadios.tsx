import MoveMode from '@renderer/components/MoveMode'
import TeamRadio from '@renderer/components/TeamRadios/TeamRadio'
import styles from '@renderer/components/TeamRadios/TeamRadios.module.scss'
import LiveTiming from '@renderer/hooks/useLiveTiming'
import {
  IDriverList,
  ISessionInfo,
  ITeamRadio,
  ITeamRadioCapture
} from '@renderer/types/LiveTimingStateTypes'
import { timeToMiliseconds } from '@renderer/utils/convertTime'
import { useEffect, useState } from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import StatusButton from '../components/TeamRadios/StatusButton'
import { speed4 } from '@renderer/constants/refreshIntervals'
import { teamRadioSettings } from '@renderer/modules/Settings'
import { reduceAllPlayersVolume, restoreAllPlayersVolume } from '@renderer/utils/controlPlayers'

interface IStateData {
  SessionInfo?: ISessionInfo
  TeamRadio?: ITeamRadio
  DriverList?: IDriverList
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
    autoplay: teamRadioSettings?.settings?.autoplay?.value ?? false,
    play: true
  })

  console.log(teamRadioSettings)

  const [audioPlaying, setAudioPlaying] = useState<boolean>(false)

  const [queue, setQueue] = useState<ITeamRadioCapture[]>([])

  const minimizeAnimations = teamRadioSettings?.settings?.minimize_animations?.value ?? false

  const volumeChangePercentage = teamRadioSettings?.settings?.volume_change_percentage?.value ?? 0

  const keybind =
    teamRadioSettings?.settings?.pause_keybind?.value?.filter((key) => key).join('+') ?? null

  const handleDataReceived = (stateData: IStateData, firstPatch: boolean) => {
    console.log(stateData)

    const dataTeamRadios = stateData.TeamRadio?.Captures || []

    if (JSON.stringify(sessionInfo) !== JSON.stringify(stateData.SessionInfo))
      setSessionInfo(stateData?.SessionInfo || null)

    if (JSON.stringify(stateData.DriverList) !== JSON.stringify(driverList))
      setDriverList(stateData.DriverList || {})

    if (teamRadios.length !== dataTeamRadios.length) {
      const newTeamRadios = dataTeamRadios.filter(
        (radio) => !teamRadios.find((oldRadio) => oldRadio.Path === radio.Path)
      )

      if (newTeamRadios.length > 0 && !firstPatch) {
        setQueue([...queue, ...[...newTeamRadios]])
      }

      setTeamRadios([...dataTeamRadios].reverse())
    }
  }

  const handleAudioStop = () => {
    setAudioPlaying(false)
    if (buttonStatuses.autoplay) {
      setQueue((prevQueue) => prevQueue.slice(1))
    }
  }

  LiveTiming(['TeamRadio', 'DriverList', 'SessionInfo'], handleDataReceived, speed4)

  useEffect(() => {
    console.log(teamRadioSettings?.settings?.pause_keybind?.value)
    console.log(keybind)
    if (keybind) {
      window.ipcRenderer.send('initialize-keybind', keybind)

      window.addEventListener('beforeunload', () => {
        window.ipcRenderer.send('remove-keybind', keybind)
      })
    }
  }, [])

  useEffect(() => {
    window.ipcRenderer.on('keybind-pressed', () => {
      setButtonStatuses({ ...buttonStatuses, play: !buttonStatuses.play })
    })
  }, [buttonStatuses])

  useEffect(() => {
    if (!buttonStatuses.autoplay && queue.length > 0) setQueue([])

    if (buttonStatuses.play && !audioPlaying && queue.length > 0) {
      setAudioPlaying(true)
    }
  }, [buttonStatuses.autoplay, buttonStatuses.play])

  useEffect(() => {
    if (volumeChangePercentage) {
      queue.length ? reduceAllPlayersVolume(volumeChangePercentage) : restoreAllPlayersVolume()
    }
  }, [queue.length === 0])

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
                  onAudioStart={() => setAudioPlaying(true)}
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
