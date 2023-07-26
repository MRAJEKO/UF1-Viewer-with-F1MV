import {
  StatusSeriesTitleMappings,
  StatusSeriesColorMappings,
  StatusSeriesStatusMappings
} from '@renderer/constants/StatusSeriesMappings'
import Colors, { sessionLogHexModifier } from '@renderer/modules/Colors'
import { ISessionLog } from '@renderer/pages/SessionLog'
import {
  ISessionInfo,
  ISessionData,
  ISessionSerie,
  IStatusSerie
} from '@renderer/types/LiveTimingStateTypes'
import { updateLogs } from '@renderer/utils/updateLogs'
import SingleCardSessionLog from './SingleCardSessionLog'

interface IData {
  SessionInfo?: ISessionInfo
  SessionData?: ISessionData
}

const StatusSerieSessionLogs = (
  newLogs: ISessionLog[],
  data: IData,
  sessionStatusSeries: ISessionSerie[] | null,
  setSessionStatusSeries: React.Dispatch<React.SetStateAction<ISessionSerie[]>>,
  trackTimeUtc: number
) => {
  const { SessionData } = data

  if (SessionData?.StatusSeries?.length !== sessionStatusSeries?.length) {
    const { newData, modifiedLogs } = updateLogs(
      newLogs,
      SessionData?.StatusSeries || [],
      sessionStatusSeries || [],
      trackTimeUtc,
      (statusSerie: IStatusSerie) => GenerateLog(data, statusSerie)
    )

    setSessionStatusSeries(newData)
    return modifiedLogs
  }

  return newLogs
}

const GenerateLog = (data: IData, statusSerie: ISessionSerie) => {
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

export default StatusSerieSessionLogs
