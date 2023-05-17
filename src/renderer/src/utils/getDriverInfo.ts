import Colors from '@renderer/modules/Colors'
import { IDriverList } from '@renderer/types/LiveTimingStateTypes'

export const getDriverInfo = (driver: string, DriverList?: IDriverList) => {
  const driverInfo = DriverList?.[driver]

  const teamColour: string = driverInfo?.TeamColour ? '#' + driverInfo?.TeamColour : Colors.black

  const driverName: string =
    driverInfo?.FirstName && driverInfo?.LastName
      ? `${driverInfo.FirstName} ${driverInfo.LastName}`
      : driverInfo?.Tla ?? 'Unknown'

  return {
    driverInfo,
    driverName,
    teamColour
  }
}
