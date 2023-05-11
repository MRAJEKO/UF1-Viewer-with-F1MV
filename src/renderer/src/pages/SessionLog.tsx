import { useCallback, useState } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import { sessionLogSettings } from '../modules/Settings'

import { IRaceControlMessage, ISessionSerie } from '@renderer/types/LiveTimingStateTypes'
import { ILiveTimingState } from '@renderer/types/LiveTimingStateTypes'
import { ILapCount } from '@renderer/types/LiveTimingStateTypes'

import LiveTimingClock, { ILiveTimingClockData } from '@renderer/hooks/useLiveTimingClock'
import LiveTiming from '@renderer/hooks/useLiveTiming'

import { isWantedMessage } from '@renderer/utils/isWantedMessage'
import { calculateTrackTime } from '@renderer/utils/trackTime'

import MoveMode from '@renderer/components/MoveMode'
import WindowHeader from '@renderer/components/WindowHeader'

import styles from '../components/SessionLog/SessionLog.module.css'
import GenerateRaceControlMessageLog from '@renderer/components/SessionLog/GenerateRaceControlMessageLog'
import { updateLogs } from '@renderer/utils/updateLogs'
import GenerateStatusSerieSessionLog from '@renderer/components/SessionLog/GenerateStatusSerieSessionLog'

interface ISessionLog {
  time: number
  key: string
  element: JSX.Element
}

const WANTED_CATEGORIES: (IRaceControlMessage['SubCategory'] | IRaceControlMessage['Category'])[] =
  [
    'Flag',
    'Other',
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

  const [sessionStatusSeries, setSessionStatusSeries] = useState<ISessionSerie[]>([])

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

      if (dataRaceControlMessages.length !== raceControlMessages.length) {
        const { newData, modifiedLogs } = updateLogs(
          newLogs,
          dataRaceControlMessages,
          raceControlMessages,
          utcTime,
          (raceControlMessage) => GenerateRaceControlMessageLog(data, raceControlMessage)
        )

        console.log(modifiedLogs)

        setRaceControlMessages(newData)
        newLogs = modifiedLogs
      }

      const dataSessionStatusSeries: ISessionSerie[] = data?.SessionData?.StatusSeries || []

      if (dataSessionStatusSeries.length !== sessionStatusSeries.length) {
        const { newData, modifiedLogs } = updateLogs(
          newLogs,
          dataSessionStatusSeries,
          sessionStatusSeries,
          utcTime,
          (sessionSerie) => GenerateStatusSerieSessionLog(data, sessionSerie)
        )

        console.log('newData', newData)
        console.log('modifiedLogs', modifiedLogs)

        setSessionStatusSeries(newData)
        newLogs = modifiedLogs
      }

      if (!logs.length || JSON.stringify(newLogs) !== JSON.stringify(logs))
        setLogs([...newLogs.filter((log) => (!log ? false : log.time <= trackTime))])
    },
    [raceControlMessages, sessionStatusSeries, lapCount, liveTimingClockData, logs]
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
              timeout={500}
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
