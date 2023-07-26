import Colors, { sessionLogHexModifier } from '@renderer/modules/Colors'
import { ISessionLog } from '@renderer/pages/SessionLog'
import {
  IDriverList,
  ITimingData,
  ISessionInfo,
  ISessionData
} from '@renderer/types/LiveTimingStateTypes'
import { getDriverInfo } from '@renderer/utils/getDriverInfo'
import DoubleSessionLog from './DoubleSessionLog'

interface IData {
  DriverList?: IDriverList
  TimingData?: ITimingData
  SessionInfo?: ISessionInfo
  SessionData?: ISessionData
}

const RetiredDriversSessionLogs = (
  newLogs: ISessionLog[],
  data: IData,
  retiredDrivers: string[],
  setRetiredDrivers: React.Dispatch<React.SetStateAction<string[]>>,
  trackTimeUtc: number
) => {
  const { DriverList, TimingData } = data

  const dataRetiredDrivers: string[] = Object.keys(TimingData?.Lines ?? {}).filter(
    (driver) => TimingData?.Lines[driver].Retired || TimingData?.Lines[driver].Stopped
  )

  if (dataRetiredDrivers.length > retiredDrivers.length) {
    setRetiredDrivers(dataRetiredDrivers)
    return [
      ...newLogs,
      ...dataRetiredDrivers
        .filter((driver) => !retiredDrivers.includes(driver))
        .map((driver) => {
          const { driverName, teamColour } = getDriverInfo(driver, DriverList)

          const driverTimingData = TimingData?.Lines?.[driver]

          return {
            time: trackTimeUtc,
            key: driver + 'retired',
            element: (
              <DoubleSessionLog
                title="Car Status"
                color1={teamColour + sessionLogHexModifier}
                color2={Colors.red + sessionLogHexModifier}
                time={trackTimeUtc}
                left={driverName}
                right={driverTimingData?.Retired ? 'Retired' : 'Stopped'}
                data={data}
              />
            )
          }
        })
    ]
  } else if (dataRetiredDrivers.length < retiredDrivers.length) {
    setRetiredDrivers(dataRetiredDrivers)

    return [
      ...newLogs.filter(
        (log) =>
          !(
            retiredDrivers.includes(log.key.split('retired')[0]) &&
            !dataRetiredDrivers.includes(log.key.split('retired')[0])
          )
      )
    ]
  }

  return newLogs
}

export default RetiredDriversSessionLogs
