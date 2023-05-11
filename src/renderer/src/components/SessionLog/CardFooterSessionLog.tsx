import { ILiveTimingState } from '@renderer/types/LiveTimingStateTypes'
import { milisecondsToTime, timeToMiliseconds } from '@renderer/utils/convertTime'

interface Props {
  time: string
  data: ILiveTimingState
}

const CardFooterSessionLog = ({ time, data }: Props) => {
  const timeMs = new Date(time.endsWith('Z') ? time : time + 'Z').getTime()

  const dataGmtOffset = data?.SessionInfo?.GmtOffset ?? '00:00:00'

  const sessionDataSeries = data?.SessionData?.Series

  const seriesIndex = sessionDataSeries
    ? sessionDataSeries.findIndex((serie) => new Date(serie.Utc).getTime() > timeMs)
    : -1

  const lap = sessionDataSeries?.at(seriesIndex === -1 ? -1 : seriesIndex - 1)?.Lap

  const qualifyingPart = sessionDataSeries?.at(seriesIndex)?.QualifyingPart

  const displayTime = milisecondsToTime(timeMs + timeToMiliseconds(dataGmtOffset))

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
      <p>{displayTime}</p>
      {(lap && seriesIndex > 0 && <p>Lap {lap}</p>) ||
        (qualifyingPart && seriesIndex > 0 && <p>Q{qualifyingPart}</p>)}
    </div>
  )
}

export default CardFooterSessionLog
