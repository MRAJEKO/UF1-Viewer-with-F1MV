import { useEffect, useState } from 'react'
import { speed4 } from '@renderer/constants/refreshIntervals'
import LiveTiming from '@renderer/hooks/useLiveTiming'
import { autoSwitcherSettings, generalSettings } from '@renderer/modules/Settings'
import {
  ICarData,
  IDriverList,
  ILapCount,
  ISessionInfo,
  ISessionStatus,
  ITimingData,
  ITimingStats,
  ITrackStatus
} from '@renderer/types/LiveTimingStateTypes'
import { getShownDrivers, replaceWindow } from '@renderer/components/AutoSwitcher/windows'
import {
  mvpDriver,
  hiddenDriver,
  tertiaryDriver,
  secondaryDriver,
  primaryDriver
} from '@renderer/components/AutoSwitcher/driverPriority'
import { enableSpeedometers } from '@renderer/utils/controlPlayers'
import { sleep } from '@renderer/utils/sleep'
import { isDriverOnPushLap } from '@renderer/utils/driver'

interface IData {
  CarData?: ICarData
  DriverList?: IDriverList
  SessionInfo?: ISessionInfo
  SessionStatus?: ISessionStatus
  TimingData?: ITimingData
  TimingStats?: ITimingStats
  TrackStatus?: ITrackStatus
  LapCount?: ILapCount
}

export interface IList {
  drivers: string[]
  lap: number
}

const useAutoSwitcher = () => {
  const [contentId, setContentId] = useState<string | number | null>(null)

  const [mainWindow, setMainWindow] = useState<number | null>(null)

  const [actualMainWindowName, setActualMainWindowName] = useState<string | null>(null)

  const [obcCount, setObcCount] = useState<number>(0)

  const [mvp, setMvp] = useState<IList>({
    drivers: [],
    lap: 1
  })

  const [priorityList, setPriorityList] = useState<IList>({
    drivers: [],
    lap: 1
  })

  const [working, setWorking] = useState(false)

  useEffect(() => {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
      }
    })
  }, [])

  const settingsFixedDrivers = (autoSwitcherSettings?.settings?.fixed_drivers?.value || '')
    .split(',')
    .map((driver) => driver.trim())

  const enableSpeedometer = autoSwitcherSettings?.settings?.speedometer?.value || false

  const mainWindowName = autoSwitcherSettings?.settings?.main_window_name?.value || null

  const highlightedDrivers = (generalSettings?.settings?.highlighted_drivers?.value || '')
    .split(',')
    .map((driver) => driver.trim())

  const handleDataReceived = (data: IData) => {
    if (working) return

    setWorking(true)

    const {
      CarData,
      DriverList,
      SessionInfo,
      SessionStatus,
      TimingData,
      TimingStats,
      TrackStatus,
      LapCount
    } = data

    const SessionType = SessionInfo?.Type

    // let prioLog: { lap: number; drivers: string[] } = { lap: 1, drivers: [] }
    const setPriorities = async () => {
      // Setting the prio list to the old list that was inside prioLog -> drivers
      let prioList: string[] = priorityList.drivers

      // If the session is not a race or the lap that the priolist is set is not equal to the current racing lap or the priolist is empty
      // Create a new list using the vip drivers and all other drivers in timing data (sorted on racing number)

      const fixedDrivers = settingsFixedDrivers.filter((driverTla: string) => {
        for (const driverNumber in DriverList) {
          if (DriverList[driverNumber].Tla === driverTla) {
            const driverTimingData = TimingData?.Lines?.[driverNumber]

            if (!driverTimingData) return

            if (!driverTimingData.Retired && !driverTimingData.Stopped) return driverNumber

            return false
          }
        }

        return false
      })

      if (
        SessionType !== 'Race' ||
        SessionStatus?.Status === 'Finished' ||
        priorityList.lap !== LapCount?.CurrentLap ||
        prioList.length === 0
      ) {
        prioList = []
        for (const vip of highlightedDrivers) {
          for (const driver in DriverList) {
            const driverTla = DriverList?.[driver].Tla

            const driverRaceNumber = DriverList?.[driver].RacingNumber

            if (vip === driverTla) {
              console.log(driverTla)

              prioList.push(driverRaceNumber)
              break
            }
          }
        }
        // Fill the rest of the prio list with all drivers inside of timing data that are not already in the list (are vip drivers)
        for (
          let position = 1;
          position <= Object.values(TimingData?.Lines ?? {}).length;
          position++
        ) {
          for (const driver in TimingData?.Lines) {
            const driverTimingData = TimingData?.Lines?.[driver]

            if (
              parseInt(driverTimingData?.Position ?? '0') === position &&
              !prioList.includes(driver)
            )
              prioList.push(driver)
          }
        }
      }
      let mvpDrivers: string[] = []
      let primaryDrivers: string[] = []
      let secondaryDrivers: string[] = []
      let tertiaryDrivers: string[] = []
      let hiddenDrivers: string[] = []

      for (const driverNumber of prioList) {
        if (fixedDrivers.includes(driverNumber)) continue

        if (
          mvpDriver(
            driverNumber,
            mvp,
            setMvp,
            TimingData,
            CarData,
            SessionType,
            SessionStatus?.Status,
            TrackStatus?.Status,
            LapCount
          )
        )
          mvpDrivers.push(driverNumber)
        else if (hiddenDriver(driverNumber, TimingData, SessionType))
          hiddenDrivers.push(driverNumber)
        else if (
          tertiaryDriver(
            driverNumber,
            TimingData,
            CarData,
            SessionType,
            LapCount,
            SessionStatus?.Status
          )
        )
          tertiaryDrivers.push(driverNumber)
        else if (SessionType !== 'Race') {
          isDriverOnPushLap(
            driverNumber,
            SessionStatus?.Status,
            TrackStatus?.Status,
            TimingData,
            TimingStats,
            SessionType
          )
            ? primaryDrivers.push(driverNumber)
            : secondaryDrivers.push(driverNumber)
        } else {
          if (secondaryDriver(driverNumber, TimingData, LapCount))
            secondaryDrivers.push(driverNumber)
          else if (primaryDriver(driverNumber, TimingData, LapCount))
            primaryDrivers.push(driverNumber)
        }
      }

      console.log(fixedDrivers)
      console.log(mvpDrivers)
      console.log(primaryDrivers)
      console.log(secondaryDrivers)
      console.log(tertiaryDrivers)
      console.log(hiddenDrivers)

      const newList = [
        ...fixedDrivers,
        ...mvpDrivers,
        ...primaryDrivers,
        ...secondaryDrivers,
        ...tertiaryDrivers,
        ...hiddenDrivers
      ]

      if (SessionType === 'Race')
        setPriorityList({ drivers: newList, lap: LapCount?.CurrentLap || 1 })

      return newList
    }

    // Runing all function to add the funtionality
    async function run() {
      if (enableSpeedometer) enableSpeedometers()

      const videoData = await getShownDrivers(
        contentId,
        setContentId,
        mainWindow,
        setMainWindow,
        mainWindowName,
        setActualMainWindowName
      )

      console.log(contentId)

      if (!contentId) {
        setWorking(false)
        return
      }

      const shownDrivers = videoData ?? {}

      const onboardCount = Object.keys(shownDrivers).length

      setObcCount(onboardCount)

      const prioList = await setPriorities()
      loop1: for (const prioIndex in prioList) {
        const driver = prioList[prioIndex]
        if (parseInt(prioIndex) < onboardCount) {
          if (!shownDrivers[driver]) {
            for (const shownDriver in shownDrivers) {
              if (!prioList.slice(0, onboardCount).includes(shownDriver)) {
                console.log('Replace ' + shownDriver + ' with ' + driver)

                const oldWindowId = shownDrivers[shownDriver]

                await replaceWindow(
                  oldWindowId,
                  parseInt(driver),
                  contentId,
                  enableSpeedometer,
                  mainWindow
                )

                await sleep(1000)

                break loop1
              }
            }
          }
        } else {
          break
        }
      }

      setWorking(false)
    }

    run()
  }

  LiveTiming(
    [
      'CarData',
      'DriverList',
      'SessionInfo',
      'SessionStatus',
      'TimingData',
      'TimingStats',
      'TrackStatus',
      'LapCount'
    ],
    handleDataReceived,
    speed4
  )

  return { mainWindowName: actualMainWindowName, obcCount }
}
export default useAutoSwitcher
