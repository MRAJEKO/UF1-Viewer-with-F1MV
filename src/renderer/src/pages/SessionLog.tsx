import styles from '../components/SessionLog/SessionLog.module.css'
import { sessionLog } from '../modules/Settings'
import WindowHeader from '@renderer/components/WindowHeader'
import MoveMode from '@renderer/components/MoveMode'
import { useCallback, useEffect, useState } from 'react'
import { IRaceControlMessage } from '@renderer/types/RaceControlMessagesTypes'
import { ILiveTimingData } from '@renderer/types/LiveTimingDataTypes'
import LiveTiming from '@renderer/hooks/useLiveTiming'
import { ITrackStatus } from '@renderer/types/TrackStatusTypes'
import SingleSessionLog from '@renderer/components/SessionLog/SingleCardSessionLog'
import { TrackStatusColors } from '@renderer/constants/TrackStatusMappings'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import LiveTimingClock, { ILiveTimingClockData } from '@renderer/hooks/useLiveTimingClock'
import { calculateTrackTime } from '@renderer/utils/trackTime'
import { milisecondsToTime } from '@renderer/utils/convertTime'
import { ILapCount } from '@renderer/types/LapCountTypes'

interface ISessionLog {
  time: number
  element: JSX.Element
}

const SessionLog = () => {
  const [raceControlMessages, setRaceControlMessages] = useState<IRaceControlMessage[] | null>(null)
  const [trackStatus, setTrackStatus] = useState<ITrackStatus | null>(null)

  const [liveTimingClockData, setLiveTimingClockData] = useState<ILiveTimingClockData | null>(null)

  const [GmtOffset, setGmtOffset] = useState<string>('00:00:00')

  const [lapCount, setLapCount] = useState<ILapCount | null>(null)

  const [logs, setLogs] = useState<ISessionLog[]>([])

  const addLog = (log: JSX.Element) => {
    const now = new Date().getTime()
    const trackTime = liveTimingClockData
      ? calculateTrackTime(now, liveTimingClockData, GmtOffset) ?? 0
      : 0

    setLogs([...logs, { time: trackTime, element: log }])
  }

  useEffect(() => {
    if (liveTimingClockData?.trackTime) {
      console.log(liveTimingClockData.trackTime)
      console.log(logs)
      setLogs([
        ...logs.filter((log) => {
          console.log(log.time)
          log.time < parseInt(liveTimingClockData.trackTime)
        })
      ])
    }
  }, [liveTimingClockData?.trackTime])

  const handleDataReceived = useCallback(
    (data: ILiveTimingData) => {
      if (data?.SessionInfo?.GmtOffset && data?.SessionInfo?.GmtOffset !== GmtOffset)
        setGmtOffset(data?.SessionInfo?.GmtOffset)

      const dataRaceControlMessages = data?.RaceControlMessages?.Messages

      if (data?.LapCount && JSON.stringify(data?.LapCount) !== JSON.stringify(lapCount))
        setLapCount(data?.LapCount)

      if (
        dataRaceControlMessages &&
        JSON.stringify(dataRaceControlMessages) !== JSON.stringify(raceControlMessages)
      ) {
        const raceControlMessagesLength = raceControlMessages?.length
        const dataRaceControlMessagesLength = dataRaceControlMessages?.length
        setRaceControlMessages(dataRaceControlMessages)
        if (raceControlMessages)
          dataRaceControlMessages.forEach((message) => {
            // addLog(<p key={message.Utc}>{message.Message}</p>)
          })
      }

      const dataTrackStatus = data?.TrackStatus

      if (dataTrackStatus && JSON.stringify(dataTrackStatus) !== JSON.stringify(trackStatus)) {
        setTrackStatus(dataTrackStatus)
        const now = new Date().getTime()
        const trackTime = liveTimingClockData
          ? calculateTrackTime(now, liveTimingClockData, GmtOffset) ?? 0
          : 0

        console.log(trackTime)

        if (trackStatus)
          addLog(
            <SingleSessionLog
              title={'Track Status'}
              color={TrackStatusColors[dataTrackStatus.Status]}
              time={milisecondsToTime(trackTime)}
              status={dataTrackStatus.Status}
              lap={lapCount?.CurrentLap}
            />
          )
      }
    },
    [raceControlMessages, trackStatus, lapCount]
  )

  LiveTiming(
    ['RaceControlMessages', 'TrackStatus', 'SessionInfo', 'LapCount'],
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

  console.log(raceControlMessages, trackStatus)

  return (
    <div className={styles.wrapper}>
      <MoveMode />
      {sessionLog?.settings?.show_header?.value && <WindowHeader title="Session Log" />}
      <TransitionGroup>
        {logs.reverse().map((log) => (
          <CSSTransition
            key={log.time}
            timeout={500}
            classNames={{
              enter: styles['card-item-enter'],
              enterActive: styles['card-item-enter-active'],
              exit: styles['card-item-exit'],
              exitActive: styles['card-item-exit-active']
            }}
          >
            {log.element}
          </CSSTransition>
        ))}
      </TransitionGroup>
    </div>
  )
}

export default SessionLog
