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

    if (teamRadios.length !== dataTeamRadios.length) setTeamRadios(dataTeamRadios)
  }

  useLiveTiming(['TeamRadio', 'DriverList', 'SessionInfo'], handleDataReceived, 500)

  console.log(teamRadios)

  return (
    <div className={styles.container}>
      {teamRadios.reverse().map((radio) => (
        <TeamRadio
          key={radio.Path}
          sessionPath={sessionInfo?.Path}
          path={radio.Path}
          driverInfo={driverList[radio.RacingNumber]}
          utc={radio.Utc}
          gmtOffset={timeToMiliseconds(sessionInfo?.GmtOffset)}
        />
      ))}
    </div>
  )
}

export default TeamRadios
