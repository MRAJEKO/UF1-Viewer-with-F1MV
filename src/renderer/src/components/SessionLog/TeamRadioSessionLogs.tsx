import { sessionLogHexModifier } from '@renderer/modules/Colors'
import {
  ITeamRadio,
  IDriverList,
  ISessionInfo,
  ISessionData,
  ITeamRadioCapture
} from '@renderer/types/LiveTimingStateTypes'
import { getDriverInfo } from '@renderer/utils/getDriverInfo'
import { updateLogs } from '@renderer/utils/updateLogs'
import DoubleSessionLog from './DoubleSessionLog'
import { ISessionLog } from '@renderer/pages/SessionLog'

interface IData {
  TeamRadio?: ITeamRadio
  DriverList?: IDriverList
  SessionInfo?: ISessionInfo
  SessionData?: ISessionData
}

const TeamRadioSessionLogs = (
  newLogs: ISessionLog[],
  data: IData,
  teamRadios: ITeamRadioCapture[],
  setTeamRadios: React.Dispatch<React.SetStateAction<ITeamRadioCapture[]>>,
  trackTimeUtc: number
) => {
  const { DriverList, TeamRadio: dataTeamRadios } = data

  if (dataTeamRadios?.Captures?.length !== teamRadios.length) {
    const { newData, modifiedLogs } = updateLogs(
      newLogs,
      dataTeamRadios?.Captures ?? [],
      teamRadios,
      trackTimeUtc,
      (teamRadio: ITeamRadioCapture) => {
        const { driverName, teamColour } = getDriverInfo(teamRadio.RacingNumber, DriverList)

        const time = new Date(teamRadio.Utc).getTime()

        return {
          time: time,
          key: time + teamRadio.RacingNumber + 'teamRadio',
          element: (
            <DoubleSessionLog
              title="Team Radio"
              color1={teamColour + sessionLogHexModifier}
              color2={teamColour + sessionLogHexModifier}
              time={time}
              left={driverName}
              right={'NEW RADIO'}
              data={data}
            />
          )
        }
      }
    )

    setTeamRadios(newData)

    return modifiedLogs
  }

  return newLogs
}

export default TeamRadioSessionLogs
