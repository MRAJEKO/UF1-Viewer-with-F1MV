import { SessionSeriesTitleMappings } from '@renderer/constants/SessionSeriesMappings'
import Colors, { sessionLogHexModifier } from '@renderer/modules/Colors'
import { ISessionData, ISessionInfo, ISessionSerie } from '@renderer/types/LiveTimingStateTypes'
import SingleCardSessionLog from './SingleCardSessionLog'

interface IData {
  SessionInfo?: ISessionInfo
  SessionData?: ISessionData
}

const GenerateSessionSerieSessionLog = (data: IData, sessionSerie: ISessionSerie) => {
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

export default GenerateSessionSerieSessionLog
