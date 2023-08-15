import Colors from '@renderer/modules/Colors'
import TrackInfoBar from './TrackInfoBar'
import TrackInfoGroup from './TrackInfoGroup'
import TrackInfoTitle from './TrackInfoTitle'
import {
  ILapCount,
  ISessionInfo,
  ISessionStatus,
  ITimingData,
  ITimingStats
} from '@renderer/types/LiveTimingStateTypes'
import { hasSessionEnded } from '@renderer/utils/getSessionStatus'
import { calculateMaxPossibleLaps } from '@renderer/utils/calculateProgress'
import { calculateFastestLap } from '@renderer/utils/calculateFastestLap'
import { sessionLengths } from '@renderer/constants/sessionLengths'

interface IData {
  SessionInfo?: ISessionInfo
  TimingStats?: ITimingStats
  TimingData?: ITimingData
  LapCount?: ILapCount
  SessionStatus?: ISessionStatus
}

interface ITrackInfoSessionProps {
  sessionTimeMs: number | undefined
  data: IData
}

const TrackInfoProgress = ({ sessionTimeMs, data }: ITrackInfoSessionProps) => {
  const { SessionInfo, TimingStats, TimingData, LapCount, SessionStatus } = data

  const { Type: sessionType, Name: sessionName } = SessionInfo || {}

  const { Status: SessionStatusStatus } = SessionStatus || {}

  const started = SessionStatusStatus !== 'Inactive'

  const finished = hasSessionEnded(SessionStatusStatus)

  const fastestLap = calculateFastestLap(TimingStats)

  const sessionInactive = (!started && !finished) || finished

  const aborted = SessionStatusStatus === 'Aborted'

  switch (sessionType) {
    case 'Race': {
      const { CurrentLap, TotalLaps } = LapCount || {}

      if (!LapCount || !CurrentLap || !TotalLaps) return null

      const maxLaps = calculateMaxPossibleLaps(
        fastestLap,
        LapCount,
        SessionStatus?.Status,
        sessionTimeMs
      )

      const progressPercentage = !started ? 0 : Math.floor((CurrentLap / TotalLaps) * 100)

      const maxPercentage = Math.floor((maxLaps / TotalLaps) * 100)

      const color =
        maxLaps < TotalLaps / 2 ? Colors.red : maxLaps < TotalLaps ? Colors.orange : Colors.green

      const colorCheck = (finished || aborted || sessionInactive) && maxPercentage === 100

      return (
        <TrackInfoGroup>
          <TrackInfoTitle title={'PROGRESS'} />
          <TrackInfoBar
            textColor={colorCheck ? Colors.black : null}
            color={colorCheck ? Colors.gray : color}
            text={
              finished && progressPercentage === 100
                ? 'CONCLUDED'
                : `${progressPercentage}% - ${maxPercentage}%`
            }
          />
          <TrackInfoBar
            textColor={colorCheck ? Colors.black : null}
            color={colorCheck ? Colors.gray : color}
            text={`Lap ${CurrentLap?.toString() ?? '?'} / ${maxLaps}`}
          />
        </TrackInfoGroup>
      )
    }
    case 'Qualifying': {
      const { SessionPart, NoEntries } = TimingData || {}

      if (!SessionPart) return null

      const sessionDuration =
        sessionLengths[sessionName ?? sessionType]?.parts?.[SessionPart - 1] ??
        sessionLengths[sessionType]?.parts?.[SessionPart]

      if (!sessionDuration) return null

      const progressPercentage = sessionTimeMs
        ? Math.floor(100 - (sessionTimeMs / sessionDuration) * 100)
        : '?'

      return (
        <TrackInfoGroup>
          <TrackInfoTitle title={'PROGRESS'} />
          <TrackInfoBar
            textColor={finished || aborted || sessionInactive ? Colors.black : null}
            color={finished || aborted || sessionInactive ? Colors.gray : Colors.green}
            text={finished ? 'CONCLUDED' : `${progressPercentage}% / 100%`}
          />
          <TrackInfoBar
            textColor={sessionInactive || aborted ? Colors.black : null}
            color={sessionInactive || aborted ? Colors.gray : Colors.green}
            text={`Q${SessionPart?.toString() ?? '?'} / Q${NoEntries?.length ?? '?'}`}
          />
        </TrackInfoGroup>
      )
    }
    default:
      const { StartDate, EndDate } = SessionInfo || {}

      const sessionDuration =
        StartDate && EndDate
          ? new Date(EndDate).getTime() - new Date(StartDate).getTime()
          : undefined

      const progressPercentage =
        sessionDuration && sessionTimeMs
          ? Math.floor(100 - (sessionTimeMs / sessionDuration) * 100)
          : '?'

      return (
        <TrackInfoGroup>
          <TrackInfoTitle title={'PROGRESS'} />
          <TrackInfoBar
            textColor={finished || sessionInactive ? Colors.black : null}
            color={finished || sessionInactive ? Colors.gray : Colors.green}
            text={finished ? 'CONCLUDED' : `${progressPercentage}% / 100%`}
          />
        </TrackInfoGroup>
      )
  }
}

export default TrackInfoProgress
