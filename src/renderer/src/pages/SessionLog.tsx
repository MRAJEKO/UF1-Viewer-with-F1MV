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
  ITeamRadio,
  ITeamRadioCapture,
  ITimingData,
  ITrackStatus
} from '@renderer/types/LiveTimingStateTypes'

import { ILiveTimingClockData } from '@renderer/hooks/useLiveTimingClock'

import MoveMode from '@renderer/components/MoveMode'
import WindowHeader from '@renderer/components/WindowHeader'

import styles from '../components/SessionLog/SessionLog.module.scss'
import RaceControlMessageLogs from '@renderer/components/SessionLog/RaceControlMessageLogs'
import StatusSerieSessionLogs from '@renderer/components/SessionLog/StatusSerieSessionLogs'
import useLiveTimingStateClock from '@renderer/hooks/useLiveTimingStateClock'
import PitlaneSessionLogs, {
  IDriversPitStatuses
} from '@renderer/components/SessionLog/PitLaneSessionLogs'
import SessionSerieSessionLogs from '@renderer/components/SessionLog/SessionSerieSessionLogs'
import { speed3 } from '@renderer/constants/refreshIntervals'
import useTrackTime from '@renderer/hooks/useTrackTime'
import TeamRadioSessionLogs from '@renderer/components/SessionLog/TeamRadioSessionLogs'
import RetiredDriversSessionLogs from '@renderer/components/SessionLog/RetiredDriversSessionLogs'
import PracticeStartSessionLogs from '@renderer/components/SessionLog/PracticeStartSessionLogs'

export interface ISessionLog {
  time: number
  key: string
  element: JSX.Element
}

interface IStateData {
  RaceControlMessages?: IRaceControlMessages
  TeamRadio?: ITeamRadio
  TrackStatus?: ITrackStatus
  SessionInfo?: ISessionInfo
  SessionData?: ISessionData
  TimingData?: ITimingData
  DriverList?: IDriverList
  CarData?: ICarData
}

const SessionLog = () => {
  const [sessionInfo, setSessionInfo] = useState<ISessionInfo>({} as ISessionInfo)

  const [raceControlMessages, setRaceControlMessages] = useState<IRaceControlMessage[]>([])

  const [practiceStartDrivers, setPracticeStartDrivers] = useState<string[]>([])

  const [teamRadios, setTeamRadios] = useState<ITeamRadioCapture[]>([])

  const [sessionSeries, setSessionSeries] = useState<ISessionSerie[]>([])

  const [sessionStatusSeries, setSessionStatusSeries] = useState<IStatusSerie[]>([])

  const [driversPitStatuses, setDriversPitStatuses] = useState<IDriversPitStatuses>({})

  const [liveTimingClockData, setLiveTimingClockData] = useState<ILiveTimingClockData | null>(null)

  const [logs, setLogs] = useState<ISessionLog[]>([])

  const [retiredDrivers, setRetiredDrivers] = useState<string[]>([])

  const { trackTimeUtc } = useTrackTime()

  const {
    team_radios: logteamRadios,
    retired_drivers: logRetiredDrivers,
    practice_starts: logPracticeStarts
  } = Object.keys(sessionLogSettings?.settings ?? [])
    .map((key) => {
      const setting = sessionLogSettings?.settings?.[key]?.value

      if (setting !== undefined) return { [key]: setting }

      return {}
    })
    .reduce((acc, curr) => ({ ...acc, ...curr }), {})

  const resetStates = (dataSessionInfo: ISessionInfo) => {
    setSessionInfo(dataSessionInfo)
    setRaceControlMessages([])
    setPracticeStartDrivers([])
    setTeamRadios([])
    setSessionSeries([])
    setSessionStatusSeries([])
    setDriversPitStatuses({})
    setRetiredDrivers([])
    setLogs([])
  }

  const handleDataReceived = useCallback(
    (stateData: IStateData, clockData: ILiveTimingClockData, firstPatch: boolean) => {
      if (!firstPatch && (!trackTimeUtc || !stateData || !clockData || clockData.paused)) return

      const { SessionInfo: dataSessionInfo } = stateData

      const sessionType = dataSessionInfo?.Type

      if (dataSessionInfo && JSON.stringify(dataSessionInfo) !== JSON.stringify(sessionInfo)) {
        resetStates(dataSessionInfo)
        return
      }

      if (JSON.stringify(clockData) !== JSON.stringify(liveTimingClockData))
        setLiveTimingClockData(clockData)

      let newLogs: ISessionLog[] = [...logs]

      newLogs = RaceControlMessageLogs(
        newLogs,
        stateData,
        raceControlMessages,
        setRaceControlMessages,
        trackTimeUtc
      )

      // New team radios
      if (logteamRadios)
        newLogs = TeamRadioSessionLogs(newLogs, stateData, teamRadios, setTeamRadios, trackTimeUtc)

      // Session Status Changes
      newLogs = StatusSerieSessionLogs(
        newLogs,
        stateData,
        sessionStatusSeries,
        setSessionStatusSeries,
        trackTimeUtc
      )

      // Lap/qualifying part counter
      newLogs = SessionSerieSessionLogs(
        newLogs,
        stateData,
        sessionSeries,
        setSessionSeries,
        trackTimeUtc
      )

      // Pit in and pit out
      newLogs = PitlaneSessionLogs(
        newLogs,
        stateData,
        driversPitStatuses,
        setDriversPitStatuses,
        trackTimeUtc
      )

      // Retired drivers
      if (logRetiredDrivers)
        newLogs = RetiredDriversSessionLogs(
          newLogs,
          stateData,
          retiredDrivers,
          setRetiredDrivers,
          trackTimeUtc
        )

      if (sessionType === 'Practice' && logPracticeStarts) {
        newLogs = PracticeStartSessionLogs(
          newLogs,
          stateData,
          practiceStartDrivers,
          setPracticeStartDrivers,
          trackTimeUtc
        )
      }

      if (!logs.length || JSON.stringify(newLogs) !== JSON.stringify(logs))
        setLogs([
          ...newLogs.filter((log) => {
            return !log ? false : log.time <= trackTimeUtc
          })
        ])
    },
    [
      raceControlMessages,
      sessionStatusSeries,
      trackTimeUtc,
      teamRadios,
      driversPitStatuses,
      liveTimingClockData,
      logs,
      practiceStartDrivers
    ]
  )

  useLiveTimingStateClock(
    [
      'RaceControlMessages',
      'TeamRadio',
      'TrackStatus',
      'SessionInfo',
      'SessionData',
      'TimingData',
      'DriverList',
      'CarData'
    ],
    ['paused', 'liveTimingStartTime', 'systemTime', 'trackTime'],
    handleDataReceived,
    speed3
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
