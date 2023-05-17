import { useCallback, useState } from 'react'
import { CSSTransition, TransitionGroup } from 'react-transition-group'

import { sessionLogSettings } from '../modules/Settings'

import {
  ICarData,
  IDriverList,
  IRaceControlMessage,
  IRaceControlMessages,
  ISessionData,
  ISessionInfo,
  ISessionSerie,
  IStatusSerie,
  ITimingData,
  ITrackStatus
} from '@renderer/types/LiveTimingStateTypes'
import { ILapCount } from '@renderer/types/LiveTimingStateTypes'

import { ILiveTimingClockData } from '@renderer/hooks/useLiveTimingClock'

import { isWantedMessage } from '@renderer/utils/isWantedMessage'
import { calculateTrackTime } from '@renderer/utils/trackTime'

import MoveMode from '@renderer/components/MoveMode'
import WindowHeader from '@renderer/components/WindowHeader'

import styles from '../components/SessionLog/SessionLog.module.css'
import GenerateRaceControlMessageLog from '@renderer/components/SessionLog/GenerateRaceControlMessageLog'
import { updateLogs } from '@renderer/utils/updateLogs'
import GenerateStatusSerieSessionLog from '@renderer/components/SessionLog/GenerateStatusSerieSessionLog'
import LiveTimingStateClock from '@renderer/hooks/useLiveTimingStateClock'
import GeneratePitlaneSessionLog, {
  IDriversPitStatuses,
  IDriverPitStatuses
} from '@renderer/components/SessionLog/GeneratePitlaneSessionLog'
import DoubleSessionLog from '@renderer/components/SessionLog/DoubleSessionLog'
import Colors, { sessionLogHexModifier } from '@renderer/modules/Colors'
import GenerateSessionSerieSessionLog from '@renderer/components/SessionLog/GenerateSessionSerieSessionlog'
import { isDoingPracticeStart } from '@renderer/utils/isDoingPracticeStart'
import { getDriverInfo } from '@renderer/utils/getDriverInfo'

interface ISessionLog {
  time: number
  key: string
  element: JSX.Element
}

interface IStateData {
  RaceControlMessages?: IRaceControlMessages
  TrackStatus?: ITrackStatus
  SessionInfo?: ISessionInfo
  LapCount?: ILapCount
  SessionData?: ISessionData
  TimingData?: ITimingData
  DriverList?: IDriverList
  CarData?: ICarData
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
  const [sessionInfo, setSessionInfo] = useState<ISessionInfo>({} as ISessionInfo)

  const [raceControlMessages, setRaceControlMessages] = useState<IRaceControlMessage[]>([])

  const [practiceStartDrivers, setPracticeStartDrivers] = useState<string[]>([])

  const [sessionSeries, setSessionSeries] = useState<ISessionSerie[]>([])

  const [sessionStatusSeries, setSessionStatusSeries] = useState<IStatusSerie[]>([])

  const [driversPitStatuses, setDriversPitStatuses] = useState<IDriversPitStatuses | null>(null)

  const [lapCount, setLapCount] = useState<ILapCount | null>(null)

  const [liveTimingClockData, setLiveTimingClockData] = useState<ILiveTimingClockData | null>(null)

  const [logs, setLogs] = useState<ISessionLog[]>([])

  const [retiredDrivers, setRetiredDrivers] = useState<string[]>([])

  const handleDataReceived = useCallback(
    (stateData: IStateData, clockData: ILiveTimingClockData) => {
      if (!stateData || !clockData) return

      const dataSessionInfo = stateData?.SessionInfo

      if (dataSessionInfo && JSON.stringify(dataSessionInfo) !== JSON.stringify(sessionInfo)) {
        setSessionInfo(dataSessionInfo)
        setRaceControlMessages([])
        setPracticeStartDrivers([])
        setSessionSeries([])
        setSessionStatusSeries([])
        setDriversPitStatuses(null)
        setLapCount(null)
        setRetiredDrivers([])
        setLogs([])

        return
      }

      if (JSON.stringify(clockData) !== JSON.stringify(liveTimingClockData))
        setLiveTimingClockData(clockData)

      let newLogs: ISessionLog[] = [...logs]

      const dataGmtOffset = stateData?.SessionInfo?.GmtOffset ?? '00:00:00'

      const now = new Date().getTime()
      const utcTime = clockData ? calculateTrackTime(now, clockData, null) : 0
      const trackTime = clockData ? calculateTrackTime(now, clockData, dataGmtOffset) ?? 0 : 0

      if (!trackTime) return

      const dataLapCount = stateData?.LapCount

      if (dataLapCount && JSON.stringify(dataLapCount) !== JSON.stringify(lapCount))
        setLapCount(dataLapCount)

      const dataRaceControlMessages = stateData?.RaceControlMessages?.Messages?.filter(
        (raceControlMessage) => isWantedMessage(raceControlMessage, WANTED_CATEGORIES)
      )

      if (
        dataRaceControlMessages &&
        dataRaceControlMessages.length !== raceControlMessages.length
      ) {
        const { newData, modifiedLogs } = updateLogs(
          newLogs,
          dataRaceControlMessages,
          raceControlMessages,
          utcTime,
          (raceControlMessage) => GenerateRaceControlMessageLog(stateData, raceControlMessage)
        )

        setRaceControlMessages(newData)
        newLogs = modifiedLogs
      }

      const dataSessionStatusSeries: ISessionSerie[] = stateData?.SessionData?.StatusSeries || []

      if (dataSessionStatusSeries.length !== sessionStatusSeries.length) {
        const { newData, modifiedLogs } = updateLogs(
          newLogs,
          dataSessionStatusSeries,
          sessionStatusSeries,
          utcTime,
          (statusSerie) => GenerateStatusSerieSessionLog(stateData, statusSerie)
        )

        setSessionStatusSeries(newData)
        newLogs = modifiedLogs
      }

      const dataSessionSeries: ISessionSerie[] = stateData?.SessionData?.Series || []

      if (dataSessionSeries.length !== sessionSeries.length) {
        const { newData, modifiedLogs } = updateLogs(
          newLogs,
          dataSessionSeries,
          sessionSeries,
          utcTime,
          (sessionSerie) => GenerateSessionSerieSessionLog(stateData, sessionSerie)
        )

        setSessionSeries(newData)
        newLogs = modifiedLogs
      }

      const dataDriversInPits: IDriversPitStatuses = Object.values(
        stateData?.TimingData?.Lines ?? {}
      )
        .map((driver) => {
          const driverNumber = driver.RacingNumber

          const driverPitStatuses = driversPitStatuses?.[driverNumber]

          const filteredData = driverPitStatuses?.filter(
            (driversPitStatus) => driversPitStatus.time <= utcTime
          )

          const lastPitStatus = filteredData?.[filteredData.length - 1]

          if (lastPitStatus?.inPit !== driver.InPit) {
            return {
              [driverNumber]: [...(filteredData ?? []), { time: utcTime, inPit: driver.InPit }]
            }
          }

          return { [driverNumber]: filteredData }
        })
        .filter((item): item is { [key: string]: IDriverPitStatuses[] } => item !== null)
        .reduce((acc, curr) => ({ ...acc, ...curr }), {})

      if (!driversPitStatuses) {
        setDriversPitStatuses(dataDriversInPits)
      } else if (
        stateData.DriverList &&
        JSON.stringify(dataDriversInPits) !== JSON.stringify(driversPitStatuses)
      ) {
        console.log('dataDriversInPits', dataDriversInPits)
        setDriversPitStatuses(dataDriversInPits)

        newLogs = [...newLogs, ...GeneratePitlaneSessionLog(stateData, dataDriversInPits, utcTime)]
      }

      const dataRetiredDrivers: string[] = Object.keys(stateData.TimingData?.Lines ?? {}).filter(
        (driver) =>
          stateData.TimingData?.Lines[driver].Retired || stateData.TimingData?.Lines[driver].Stopped
      )

      if (dataRetiredDrivers.length > retiredDrivers.length) {
        setRetiredDrivers(dataRetiredDrivers)
        newLogs = [
          ...newLogs,
          ...dataRetiredDrivers
            .filter((driver) => !retiredDrivers.includes(driver))
            .map((driver) => {
              const driverInfo = stateData.DriverList?.[driver]

              const driverTimingData = stateData.TimingData?.Lines?.[driver]

              console.log(driverInfo?.TeamColour)

              const teamColour = driverInfo?.TeamColour
                ? '#' + driverInfo?.TeamColour
                : Colors.black

              const driverName =
                driverInfo?.FirstName && driverInfo?.LastName
                  ? `${driverInfo.FirstName} ${driverInfo.LastName}`
                  : driverInfo?.Tla ?? 'Unknown'

              return {
                time: utcTime,
                key: driver + 'retired',
                element: (
                  <DoubleSessionLog
                    title="Car Status"
                    color1={teamColour + sessionLogHexModifier}
                    color2={Colors.red + sessionLogHexModifier}
                    time={utcTime}
                    left={driverName}
                    right={driverTimingData?.Retired ? 'Retired' : 'Stopped'}
                    data={stateData}
                  />
                )
              }
            })
        ]
      } else if (dataRetiredDrivers.length < retiredDrivers.length) {
        setRetiredDrivers(dataRetiredDrivers)

        newLogs = [
          ...newLogs.filter(
            (log) =>
              !(
                retiredDrivers.includes(log.key.split('retired')[0]) &&
                !dataRetiredDrivers.includes(log.key.split('retired')[0])
              )
          )
        ]
      }

      if (stateData?.SessionInfo?.Type === 'Practice') {
        const dataPracticeStartDrivers = Object.keys(stateData.TimingData?.Lines ?? {}).filter(
          (driver) => isDoingPracticeStart(driver, stateData.CarData, stateData.TimingData)
        )

        if (dataPracticeStartDrivers.length > practiceStartDrivers.length) {
          setPracticeStartDrivers(dataPracticeStartDrivers)
          newLogs = [
            ...newLogs,
            ...dataPracticeStartDrivers
              .filter((driver) => !practiceStartDrivers.includes(driver))
              .map((driver) => {
                const { teamColour, driverName } = getDriverInfo(driver, stateData.DriverList)

                return {
                  time: utcTime,
                  key: driver + 'practiceStart',
                  element: (
                    <DoubleSessionLog
                      title="Pitlane"
                      color1={teamColour + sessionLogHexModifier}
                      color2={Colors.green + sessionLogHexModifier}
                      time={utcTime}
                      left={driverName}
                      right={'PRACTICE'}
                      subInfo={'START'}
                      data={stateData}
                    />
                  )
                }
              })
          ]
        } else if (dataPracticeStartDrivers.length < practiceStartDrivers.length)
          setPracticeStartDrivers(dataPracticeStartDrivers)
      }

      if (!logs.length || JSON.stringify(newLogs) !== JSON.stringify(logs))
        setLogs([...newLogs.filter((log) => (!log ? false : log.time <= utcTime))])
    },
    [
      raceControlMessages,
      sessionStatusSeries,
      driversPitStatuses,
      lapCount,
      liveTimingClockData,
      logs,
      practiceStartDrivers
    ]
  )

  LiveTimingStateClock(
    [
      'RaceControlMessages',
      'TrackStatus',
      'SessionInfo',
      'LapCount',
      'SessionData',
      'TimingData',
      'DriverList',
      'CarData'
    ],
    ['paused', 'liveTimingStartTime', 'systemTime', 'trackTime'],
    handleDataReceived,
    250
  )

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
