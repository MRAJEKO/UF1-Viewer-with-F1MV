import { SessionSeriesTitleMappings } from '@renderer/constants/SessionSeriesMappings'
import Colors, { sessionLogHexModifier } from '@renderer/modules/Colors'
import {
  ISessionData,
  ISessionInfo,
  ISessionSerie,
  IStatusSerie
} from '@renderer/types/LiveTimingStateTypes'
import SingleCardSessionLog from './SingleCardSessionLog'
import { ISessionLog } from '@renderer/pages/SessionLog'
import { updateLogs } from '@renderer/utils/updateLogs'

interface IData {
  SessionInfo?: ISessionInfo
  SessionData?: ISessionData
}

const SessionSerieSessionLogs = (
  newLogs: ISessionLog[],
  data: IData,
  sessionSeries: ISessionSerie[] | null,
  setSessionSeries: React.Dispatch<React.SetStateAction<ISessionSerie[]>>,
  trackTimeUtc: number
) => {
  const { SessionData } = data

  if (SessionData?.Series?.length !== sessionSeries?.length) {
    const { newData, modifiedLogs } = updateLogs(
      newLogs,
      SessionData?.Series || [],
      sessionSeries || [],
      trackTimeUtc,
      (sessionSerie: IStatusSerie) => GenerateLog(data, sessionSerie)
    )

    setSessionSeries(newData)

    return modifiedLogs
  }

  return newLogs
}

const GenerateLog = (data: IData, sessionSerie: ISessionSerie) => {
  const time = new Date(
    sessionSerie.Utc.endsWith('Z') ? sessionSerie.Utc : sessionSerie.Utc + 'Z'
  ).getTime()

  const key = Object.keys(sessionSerie).filter((key) => key !== 'Utc')[0]

  if (!key) return null

  return {
    time: time,
    key: time + SessionSeriesTitleMappings[key],
    element: (
      <SingleCardSessionLog
        title="Session"
        color={Colors.white + sessionLogHexModifier}
        time={sessionSerie.Utc}
        message={`${SessionSeriesTitleMappings[key]} ${sessionSerie[key]}`}
        data={data}
      />
    )
  }
}

export default SessionSerieSessionLogs
