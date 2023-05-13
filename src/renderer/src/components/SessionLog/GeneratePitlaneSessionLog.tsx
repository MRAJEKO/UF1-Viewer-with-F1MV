import Colors, { sessionLogHexModifier } from '@renderer/modules/Colors'
import {
  IDriverList,
  ISessionData,
  ISessionInfo,
  ITimingData
} from '@renderer/types/LiveTimingStateTypes'
import DoubleSessionLog from './DoubleSessionLog'

interface IData {
  DriverList?: IDriverList
  TimingData?: ITimingData
  SessionInfo?: ISessionInfo
  SessionData?: ISessionData
}

export interface IDriverInPit {
  driverNumber: string
  inPit: boolean
}

const GeneratePitlaneSessionLog = (
  data: IData,
  dataDriversInPits: IDriverInPit[],
  driversInPits: IDriverInPit[],
  utcTime: number
) => {
  if (!data.DriverList || !data.TimingData) return []
  return dataDriversInPits
    .filter(
      (dataDriver) =>
        dataDriver.inPit !==
        driversInPits.find((driver) => driver.driverNumber === dataDriver.driverNumber)?.inPit
    )
    .map((driver) => {
      const driverNumber = driver.driverNumber

      const driverInfo = data.DriverList?.[driverNumber]

      const teamColour = '#' + driverInfo?.TeamColour ?? Colors.black

      const driverName =
        driverInfo?.FirstName && driverInfo?.LastName
          ? `${driverInfo.FirstName} ${driverInfo.LastName}`
          : driverInfo?.Tla ?? 'Unknown'

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

export default GeneratePitlaneSessionLog
