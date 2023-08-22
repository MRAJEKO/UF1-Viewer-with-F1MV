import MoveMode from '@renderer/components/MoveMode'
import WindowHeader from '@renderer/components/WindowHeader'
import { speed3 } from '@renderer/constants/refreshIntervals'
import LiveTiming from '@renderer/hooks/useLiveTiming'
import {
  ICarData,
  IDriverList,
  ILapCount,
  ISessionInfo,
  ISessionStatus,
  ITimingData,
  ITrackStatus
} from '@renderer/types/LiveTimingStateTypes'
import { driverHasCrashed } from '@renderer/utils/driver'
import { useState } from 'react'
import { TransitionGroup, CSSTransition } from 'react-transition-group'

import styles from '@renderer/components/CrashDetection/CrashDetection.module.scss'
import Colors from '@renderer/modules/Colors'

interface IData {
  TimingData?: ITimingData
  DriverList?: IDriverList
  CarData?: ICarData
  SessionInfo?: ISessionInfo
  SessionStatus?: ISessionStatus
  TrackStatus?: ITrackStatus
  LapCount?: ILapCount
}

const CrashDetection = () => {
  const [crashedDrivers, setCrashedDrivers] = useState<string[]>([])

  const [driverList, setDriverList] = useState<IDriverList | null>(null)

  const handleDataReceived = (data: IData) => {
    const { TimingData, DriverList, CarData, SessionInfo, SessionStatus, TrackStatus, LapCount } =
      data

    if (DriverList && JSON.stringify(driverList) !== JSON.stringify(DriverList))
      setDriverList(DriverList ?? null)

    const newCrashedDrivers = Object.keys(DriverList ?? {})
      .filter((driverNumber) =>
        driverHasCrashed(
          driverNumber,
          TimingData,
          CarData,
          SessionInfo?.Type,
          SessionStatus?.Status,
          TrackStatus?.Status,
          LapCount
        )
      )
      .sort((a, b) => {
        const aLine = DriverList?.[a]?.Line ?? 0
        const bLine = DriverList?.[b]?.Line ?? 0

        return aLine - bLine
      })

    if (JSON.stringify(newCrashedDrivers) !== JSON.stringify(crashedDrivers))
      setCrashedDrivers(newCrashedDrivers)
  }

  LiveTiming(
    [
      'TimingData',
      'DriverList',
      'CarData',
      'SessionInfo',
      'SessionStatus',
      'TrackStatus',
      'LapCount'
    ],
    handleDataReceived,
    speed3
  )

  console.log(crashedDrivers)

  return (
    <>
      <MoveMode />
      <div>
        <WindowHeader title="Crash Detection" />
        <TransitionGroup className={styles.drivers}>
          {crashedDrivers.map((driverNumber) => {
            const driverListInfo = driverList?.[driverNumber]

            const position = `P${driverListInfo?.Line ?? '?'}`

            const color = driverListInfo?.TeamColour
              ? `#${driverListInfo.TeamColour}`
              : Colors.white

            const name = driverListInfo?.FullName ?? driverListInfo?.Tla ?? driverNumber

            return (
              <CSSTransition
                key={driverNumber}
                timeout={{ enter: 3000, exit: 500 }}
                classNames={{
                  enter: styles['animation-enter'],
                  enterActive: styles['animation-enter-active'],
                  exit: styles['animation-exit'],
                  exitActive: styles['animation-exit-active']
                }}
              >
                <div
                  className={styles.driver}
                  style={{
                    color: color
                  }}
                >
                  {`${position} | ${name}`}
                </div>
              </CSSTransition>
            )
          })}
        </TransitionGroup>
      </div>
    </>
  )
}
export default CrashDetection
