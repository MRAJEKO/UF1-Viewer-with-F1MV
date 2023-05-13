import {
  StatusSeriesTitleMappings,
  StatusSeriesColorMappings,
  StatusSeriesStatusMappings
} from '@renderer/constants/StatusSeriesMappings'
import Colors, { sessionLogHexModifier } from '@renderer/modules/Colors'
import { ISessionData, ISessionInfo, ISessionSerie } from '@renderer/types/LiveTimingStateTypes'
import SingleCardSessionLog from './SingleCardSessionLog'

interface IData {
  SessionInfo?: ISessionInfo
  SessionData?: ISessionData
}

const GenerateStatusSerieSessionLog = (data: IData, statusSerie: ISessionSerie) => {
  const time = new Date(
    statusSerie.Utc.endsWith('Z') ? statusSerie.Utc : statusSerie.Utc + 'Z'
  ).getTime()

  const key = Object.keys(statusSerie).filter((key) => key !== 'Utc')[0]

  if (!key) return null

  const type = StatusSeriesTitleMappings[key]

  const status = statusSerie[key]

  if (!status) return null

  return {
    time: time,
    key: time + type + status,
    element: (
      <SingleCardSessionLog
        title={type}
        color={(StatusSeriesColorMappings[key][status] ?? Colors.white) + sessionLogHexModifier}
        time={statusSerie.Utc}
        message={StatusSeriesStatusMappings[key] ? StatusSeriesStatusMappings[key][status] : status}
        data={data}
      />
    )
  }
}

export default GenerateStatusSerieSessionLog
