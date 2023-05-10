import { useCallback, useState } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import { sessionLogSettings } from '../modules/Settings'

import { IRaceControlMessage } from '@renderer/types/LiveTimingStateTypes'
import { ILiveTimingState } from '@renderer/types/LiveTimingStateTypes'
import { ITrackStatus } from '@renderer/types/LiveTimingStateTypes'
import { ILapCount } from '@renderer/types/LiveTimingStateTypes'

import { TrackStatusColors, TrackStatusText } from '@renderer/constants/TrackStatusMappings'

import LiveTimingClock, { ILiveTimingClockData } from '@renderer/hooks/useLiveTimingClock'
import LiveTiming from '@renderer/hooks/useLiveTiming'

import { milisecondsToTime, timeToMiliseconds } from '@renderer/utils/convertTime'
import { isWantedMessage } from '@renderer/utils/isWantedMessage'
import { calculateTrackTime } from '@renderer/utils/trackTime'

import MoveMode from '@renderer/components/MoveMode'
import WindowHeader from '@renderer/components/WindowHeader'
import SingleCardSessionLog from '@renderer/components/SessionLog/SingleCardSessionLog'

import styles from '../components/SessionLog/SessionLog.module.css'

interface ISessionLog {
  time: number
  key: string
  element: JSX.Element
}

const WANTED_CATEGORIES: IRaceControlMessage['SubCategory'][] = [
  'LapTimeDeleted',
  'TimePenalty',
  'TrackSurfaceSlippery',
  'PitEntry',
  'PitExit',
  'Drs',
  'LowGripConditions',
  'NormalGripConditions'
]

const SessionLog = () => {
  const [raceControlMessages, setRaceControlMessages] = useState<IRaceControlMessage[]>([])

  const [trackStatus, setTrackStatus] = useState<ITrackStatus | null>(null)

  const [lapCount, setLapCount] = useState<ILapCount | null>(null)

  const [liveTimingClockData, setLiveTimingClockData] = useState<ILiveTimingClockData | null>(null)

  const [logs, setLogs] = useState<ISessionLog[]>([])

  const handleDataReceived = useCallback(
    (data: ILiveTimingState) => {
      if (!data) return

      let newLogs: ISessionLog[] = [...logs]

      const dataGmtOffset = data?.SessionInfo?.GmtOffset ?? '00:00:00'

      const dataLapCount = data?.LapCount

      const now = new Date().getTime()
      const utcTime = liveTimingClockData ? calculateTrackTime(now, liveTimingClockData, null) : 0
      const trackTime = liveTimingClockData
        ? calculateTrackTime(now, liveTimingClockData, dataGmtOffset) ?? 0
        : 0

      if (!trackTime) return

      if (dataLapCount && JSON.stringify(dataLapCount) !== JSON.stringify(lapCount))
        setLapCount(dataLapCount)

      const dataRaceControlMessages = data?.RaceControlMessages?.Messages.filter(
        (raceControlMessage) => isWantedMessage(raceControlMessage, WANTED_CATEGORIES)
      )

      if (dataRaceControlMessages.length < raceControlMessages.length) {
        setRaceControlMessages(dataRaceControlMessages)
        newLogs = [...newLogs.filter((log) => log.time <= utcTime)]
      } else if (dataRaceControlMessages.length > raceControlMessages.length) {
        const newRaceControlMessages = dataRaceControlMessages?.filter(
          (message) =>
            !raceControlMessages?.some(
              (raceControlMessage) => JSON.stringify(raceControlMessage) === JSON.stringify(message)
            )
        )

        setRaceControlMessages([...raceControlMessages, ...newRaceControlMessages])
        newLogs = [
          ...newLogs,
          ...newRaceControlMessages.map((raceControlMessage: IRaceControlMessage) => {
            const time = new Date(raceControlMessage.Utc + 'Z').getTime()

            const sessionDataSeries = data?.SessionData?.Series

            const lapSeriesIndex = sessionDataSeries
              ? sessionDataSeries.findIndex((serie) => new Date(serie.Utc).getTime() > time) - 1
              : -1

            const lap = sessionDataSeries?.at(lapSeriesIndex)?.Lap

            const qualifyingPart = sessionDataSeries?.at(lapSeriesIndex)?.QualifyingPart

            const displayTime = milisecondsToTime(time + timeToMiliseconds(dataGmtOffset))

            return {
              time: time,
              key: time + raceControlMessage.Message,
              element: (
                <SingleCardSessionLog
                  title={raceControlMessage.Category}
                  message={raceControlMessage.Message}
                  color="#000000"
                  time={displayTime}
                  lap={lap}
                  qualifyingPart={qualifyingPart}
                />
              )
            }
          })
        ]
      }

      const dataTrackStatus = data?.TrackStatus

      if (dataTrackStatus && JSON.stringify(dataTrackStatus) !== JSON.stringify(trackStatus)) {
        setTrackStatus(dataTrackStatus)

        if (trackStatus)
          newLogs = [
            ...newLogs,
            {
              time: utcTime,
              key: utcTime + dataTrackStatus.Message,
              element: (
                <SingleCardSessionLog
                  title={'Track Status'}
                  color={TrackStatusColors[dataTrackStatus.Status]}
                  time={milisecondsToTime(trackTime)}
                  message={TrackStatusText[dataTrackStatus.Status]}
                  lap={dataLapCount?.CurrentLap}
                />
              )
            }
          ]
      }

      if (!logs.length || JSON.stringify(newLogs) !== JSON.stringify(logs))
        setLogs([...newLogs.filter((log) => log.time <= trackTime)])
    },
    [raceControlMessages, lapCount, trackStatus, liveTimingClockData, logs]
  )

  LiveTiming(
    ['RaceControlMessages', 'TrackStatus', 'SessionInfo', 'LapCount', 'SessionData'],
    handleDataReceived,
    500
  )

  const handleClockDataRevieved = useCallback(
    (data: ILiveTimingClockData) => {
      if (JSON.stringify(data) !== JSON.stringify(liveTimingClockData)) setLiveTimingClockData(data)
    },
    [liveTimingClockData]
  )

  LiveTimingClock(
    ['paused', 'liveTimingStartTime', 'systemTime', 'trackTime'],
    handleClockDataRevieved,
    500
  )

  console.log(logs)

  return (
    <div className={styles.wrapper}>
      <MoveMode />
      {sessionLogSettings?.settings?.show_header?.value && <WindowHeader title="Session Log" />}
      <TransitionGroup>
        {logs
          .sort((a, b) => b.time - a.time)
          .map((log) => (
            <CSSTransition
              key={log.key}
              timeout={600}
              classNames={{
                enter: styles['log-wrapper-item-enter'],
                exitActive: styles['log-wrapper-item-exit-active']
              }}
            >
              <div className={styles['log-wrapper']}>{log.element}</div>
            </CSSTransition>
          ))}
      </TransitionGroup>
    </div>
  )
}

export default SessionLog
