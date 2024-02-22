import MoveMode from '@renderer/components/MoveMode'
import PushLapCard, { ICardData } from '@renderer/components/PushLaps/PushLapCard'
import { getDriversTrackOrder } from '@renderer/components/PushLaps/PushLapOrdening'
import styles from '@renderer/components/PushLaps/PushLaps.module.scss'
import WindowHeader from '@renderer/components/WindowHeader'
import { speed1 } from '@renderer/constants/refreshIntervals'
import LiveTiming from '@renderer/hooks/useLiveTiming'
import useTrackTime from '@renderer/hooks/useTrackTime'
import { pushLapsSettings } from '@renderer/modules/Settings'
import {
  IDriverList,
  ISessionInfo,
  ISessionStatus,
  ITimingAppData,
  ITimingData,
  ITimingStats,
  ITrackStatus
} from '@renderer/types/LiveTimingStateTypes'
import { isDriverOnPushLap } from '@renderer/utils/driver'
import { useState } from 'react'

interface IData {
  SessionStatus?: ISessionStatus
  TrackStatus?: ITrackStatus
  TimingData?: ITimingData
  TimingStats?: ITimingStats
  SessionInfo?: ISessionInfo
  TimingAppData?: ITimingAppData
  DriverList?: IDriverList
}

export interface IDriversInfo {
  [driverNumber: string]: IDriverInfo
}

export interface IDriverInfo {
  lap: number | null
  lapStartTime: number | null
}

const endOfLapAnimationDuration = pushLapsSettings?.settings?.end_display_duration?.value ?? 4000
const endOfSectorAnimationDuration =
  pushLapsSettings?.settings?.sector_display_duration?.value ?? 4000

const PushLaps = () => {
  const [pushDrivers, setPushDrivers] = useState<string[]>([])

  const [driversInfo, setDriversInfo] = useState<IDriversInfo>({})

  const { trackTimeUtc } = useTrackTime()

  const [childData, setChildData] = useState<ICardData | null>(null)

  const [shownDrivers, setShownDrivers] = useState<string[]>([])

  const handleDataReceived = (stateData: IData) => {
    const {
      TimingData,
      TimingStats,
      TrackStatus,
      SessionStatus,
      SessionInfo,
      TimingAppData,
      DriverList
    } = stateData

    const newDriversInfo: IDriversInfo = Object.keys(TimingData?.Lines ?? {}).reduce(
      (acc, driverNumber) => {
        const driverTimingData = TimingData?.Lines?.[driverNumber]

        if (!driverTimingData || !driverTimingData.NumberOfLaps) return acc

        const driverInfo = driversInfo[driverNumber]

        return {
          ...acc,
          [driverNumber]: {
            lap: driverTimingData.NumberOfLaps,
            lapStartTime:
              driverInfo?.lap && driverInfo?.lap !== driverTimingData.NumberOfLaps
                ? trackTimeUtc
                : driverInfo?.lapStartTime ?? null
          }
        }
      },
      {}
    )

    const newPushDrivers = Object.keys(TimingData?.Lines ?? {}).filter((driverNumber) =>
      isDriverOnPushLap(
        driverNumber,
        SessionStatus?.Status,
        TrackStatus?.Status,
        TimingData,
        TimingStats,
        SessionInfo?.Type
      )
    )

    if (JSON.stringify(pushDrivers) !== JSON.stringify(newPushDrivers)) {
      setPushDrivers(newPushDrivers)

      const newShownDrivers = [
        ...shownDrivers,
        ...newPushDrivers.filter((driverNumber) => !shownDrivers.includes(driverNumber))
      ]

      console.log(newShownDrivers)

      const sortedDrivers = newShownDrivers.sort((d1, d2) => {
        if (!newPushDrivers.includes(d1) || !newPushDrivers.includes(d2)) {
          console.log(d1, d2)
          return 0
        }

        const trackOrder = getDriversTrackOrder([d1, d2], newDriversInfo, TimingData)

        return trackOrder.indexOf(d1) - trackOrder.indexOf(d2)
      })

      setShownDrivers(sortedDrivers)
    }

    const newChildData: ICardData = {
      timingData: TimingData,
      timingStats: TimingStats,
      timingAppData: TimingAppData,
      driverList: DriverList,
      sessionType: SessionInfo?.Type
    }

    if (JSON.stringify(childData) !== JSON.stringify(newChildData)) setChildData(newChildData)

    if (JSON.stringify(driversInfo) !== JSON.stringify(newDriversInfo))
      setDriversInfo(newDriversInfo)
  }

  LiveTiming(
    [
      'SessionStatus',
      'TrackStatus',
      'TimingData',
      'TimingStats',
      'SessionInfo',
      'TimingAppData',
      'TimingStats',
      'DriverList'
    ],
    handleDataReceived,
    speed1
  )

  return (
    <>
      <MoveMode />
      <div className={styles.container}>
        {pushLapsSettings?.settings?.show_header?.value && <WindowHeader title="Push Laps" />}
        <div>
          {childData &&
            shownDrivers.map((driverNumber) => {
              return (
                <PushLapCard
                  key={driverNumber}
                  pushing={pushDrivers.includes(driverNumber)}
                  lapStartTime={driversInfo?.[driverNumber]?.lapStartTime ?? undefined}
                  setShownDrivers={setShownDrivers}
                  driverNumber={driverNumber}
                  data={childData}
                  endOfLapAnimationDuration={endOfLapAnimationDuration}
                  endOfSectorAnimationDuration={endOfSectorAnimationDuration}
                />
              )
            })}
        </div>
      </div>
    </>
  )
}
export default PushLaps
