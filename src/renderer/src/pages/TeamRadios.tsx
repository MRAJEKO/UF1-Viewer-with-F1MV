import TeamRadio from '@renderer/components/TeamRadios/TeamRadio'
import styles from '@renderer/components/TeamRadios/TeamRadios.module.css'
import useLiveTiming from '@renderer/hooks/useLiveTiming'
import {
  IDriverList,
  ISessionInfo,
  ITeamRadio,
  ITeamRadioCapture
} from '@renderer/types/LiveTimingStateTypes'
import { timeToMiliseconds } from '@renderer/utils/convertTime'
import { useState } from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'

interface IStateData {
  SessionInfo: ISessionInfo
  TeamRadio: ITeamRadio
  DriverList: IDriverList
}

const TeamRadios = () => {
  const [driverList, setDriverList] = useState<IDriverList>({})

  const [sessionInfo, setSessionInfo] = useState<ISessionInfo | null>(null)

  const [teamRadios, setTeamRadios] = useState<ITeamRadioCapture[]>([])

  const handleDataReceived = (stateData: IStateData) => {
    const dataTeamRadios = stateData?.TeamRadio?.Captures || []

    if (JSON.stringify(sessionInfo) !== JSON.stringify(stateData?.SessionInfo))
      setSessionInfo(stateData?.SessionInfo)

    if (JSON.stringify(stateData.DriverList) !== JSON.stringify(driverList))
      setDriverList(stateData.DriverList)

    if (teamRadios.length !== dataTeamRadios.length) setTeamRadios(dataTeamRadios.reverse())
  }

  useLiveTiming(['TeamRadio', 'DriverList', 'SessionInfo'], handleDataReceived, 500)

  console.log(teamRadios)

  return (
    <div className={styles.container}>
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
              />
            </div>
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  )
}

export default TeamRadios
