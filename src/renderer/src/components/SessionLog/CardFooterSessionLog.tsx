import { ISessionData, ISessionInfo } from '@renderer/types/LiveTimingStateTypes'
import { milisecondsToTime, timeToMiliseconds } from '@renderer/utils/convertTime'

interface Props {
  time: string | number | null
  data: {
    SessionInfo?: ISessionInfo
    SessionData?: ISessionData
  }
}

const CardFooterSessionLog = ({ time, data }: Props) => {
  const timeMs = time
    ? typeof time === 'number'
      ? time
      : new Date(time.endsWith('Z') ? time : time + 'Z').getTime()
    : null

  const dataGmtOffset = data?.SessionInfo?.GmtOffset ?? '00:00:00'

  const sessionDataSeries = data?.SessionData?.Series

  const seriesIndex = timeMs
    ? sessionDataSeries
      ? sessionDataSeries.findIndex((serie) => new Date(serie.Utc).getTime() > timeMs)
      : -1
    : null

  const { Lap, QualifyingPart } = seriesIndex
    ? sessionDataSeries?.at(seriesIndex === -1 ? -1 : seriesIndex - 1) ?? {
        Lap: null,
        QualifyingPart: null
      }
    : { Lap: null, QualifyingPart: null }

  const displayTime = timeMs ? milisecondsToTime(timeMs + timeToMiliseconds(dataGmtOffset)) : null

  return (
    <div
      style={{
        backgroundColor: 'var(--black-translucent)',
        color: 'white',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        placeItems: 'center',
        padding: '3vw 0',
        fontSize: '5vw',
        fontFamily: 'InterMedium',
        borderTop: '0.5vw solid var(--white)'
      }}
    >
      {time && <p>{displayTime}</p>}
      {(Lap && seriesIndex !== 0 && <p>Lap {Lap}</p>) ||
        (QualifyingPart && seriesIndex !== 0 && <p>Q{QualifyingPart}</p>)}
    </div>
  )
}

export default CardFooterSessionLog
