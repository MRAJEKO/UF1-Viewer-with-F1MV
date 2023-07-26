import Colors, { sessionLogHexModifier } from '@renderer/modules/Colors'
import {
  IDriverList,
  ISessionData,
  ISessionInfo,
  ITimingData
} from '@renderer/types/LiveTimingStateTypes'
import DoubleSessionLog from './DoubleSessionLog'
import { getDriverInfo } from '@renderer/utils/getDriverInfo'
import { ISessionLog } from '@renderer/pages/SessionLog'

interface IData {
  DriverList?: IDriverList
  TimingData?: ITimingData
  SessionInfo?: ISessionInfo
  SessionData?: ISessionData
}

export interface IDriversPitStatuses {
  [key: string]: IDriverPitStatuses[]
}

export interface IDriverPitStatuses {
  time: number
  inPit: boolean
}

const PitlaneSessionLogs = (
  newLogs: ISessionLog[],
  data: IData,
  driversPitStatuses: IDriversPitStatuses | null,
  setDriversPitStatuses: React.Dispatch<React.SetStateAction<IDriversPitStatuses>>,
  trackTimeUtc: number
) => {
  const { DriverList, TimingData } = data

  const dataDriversInPits: IDriversPitStatuses = Object.values(TimingData?.Lines ?? {})
    .map((driver) => {
      const driverNumber = driver.RacingNumber

      const driverPitStatuses = driversPitStatuses?.[driverNumber]

      const filteredData = driverPitStatuses?.filter(
        (driversPitStatus) => driversPitStatus.time <= trackTimeUtc
      )

      const lastPitStatus = filteredData?.[filteredData.length - 1]

      if (lastPitStatus?.inPit !== driver.InPit) {
        return {
          [driverNumber]: [...(filteredData ?? []), { time: trackTimeUtc, inPit: driver.InPit }]
        }
      }

      return { [driverNumber]: filteredData }
    })
    .filter((item): item is { [key: string]: IDriverPitStatuses[] } => item !== null)
    .reduce((acc, curr) => ({ ...acc, ...curr }), {})

  if (!driversPitStatuses) {
    setDriversPitStatuses(dataDriversInPits)
  } else if (
    DriverList &&
    JSON.stringify(dataDriversInPits) !== JSON.stringify(driversPitStatuses)
  ) {
    setDriversPitStatuses(dataDriversInPits)

    return [...newLogs, ...GenerateLog(data, dataDriversInPits, trackTimeUtc)]
  }

  return newLogs
}

export default PitlaneSessionLogs

const GenerateLog = (data: IData, dataDriversInPits: IDriversPitStatuses, utcTime: number) => {
  if (!data.DriverList || !data.TimingData) return []

  return Object.keys(dataDriversInPits)
    .filter((dataDriver) => {
      const dataLastDriverInPits = dataDriversInPits[dataDriver]?.slice(-1)[0]

      const driverTimingdata = data.TimingData?.Lines?.[dataDriver]

      return (
        dataLastDriverInPits?.inPit === driverTimingdata?.InPit &&
        dataLastDriverInPits?.time === utcTime
      )
    })
    .map((driver) => {
      const driverNumber = driver

      const { driverName, teamColour } = getDriverInfo(driverNumber, data.DriverList)

      const inPit = data.TimingData?.Lines?.[driverNumber]?.InPit ?? false

      return {
        time: utcTime,
        key: utcTime + driverNumber + 'pitlane',
        element: (
          <DoubleSessionLog
            title="Pitlane"
            color1={teamColour + sessionLogHexModifier}
            color2={(inPit ? Colors.red : Colors.green) + sessionLogHexModifier}
            time={utcTime}
            left={driverName}
            right={inPit ? 'In Pit' : 'Pit Out'}
            data={data}
          />
        )
      }
    })
}
