import {
  StatusSeriesTitleMappings,
  StatusSeriesColorMappings,
  StatusSeriesStatusMappings
} from '@renderer/constants/StatusSeriesMappings'
import { sessionLogHexModifier } from '@renderer/modules/Colors'
import { ILiveTimingState, ISessionSerie } from '@renderer/types/LiveTimingStateTypes'
import SingleCardSessionLog from './SingleCardSessionLog'

const GenerateStatusSerieSessionLog = (data: ILiveTimingState, sessionSerie: ISessionSerie) => {
  const time = new Date(
    sessionSerie.Utc.endsWith('Z') ? sessionSerie.Utc : sessionSerie.Utc + 'Z'
  ).getTime()

  const key = Object.keys(sessionSerie).filter((key) => key !== 'Utc')[0]

  if (!key) return null

  const type = StatusSeriesTitleMappings[key]

  const status = sessionSerie[key]

  if (!status) return null

  return {
    time: time,
    key: time + type + status,
    element: (
      <SingleCardSessionLog
        title={type}
        color={StatusSeriesColorMappings[key][status] + sessionLogHexModifier}
        time={sessionSerie.Utc}
        message={StatusSeriesStatusMappings[key] ? StatusSeriesStatusMappings[key][status] : status}
        data={data}
      />
    )
  }
}

export default GenerateStatusSerieSessionLog
