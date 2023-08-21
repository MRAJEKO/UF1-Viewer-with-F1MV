import Colors, { sessionLogHexModifier } from '@renderer/modules/Colors'
import { ISessionLog } from '@renderer/pages/SessionLog'
import {
  ICarData,
  IDriverList,
  ITimingData,
  ISessionInfo,
  ISessionData
} from '@renderer/types/LiveTimingStateTypes'
import { getDriverInfo } from '@renderer/utils/getDriverInfo'
import { isDoingPracticeStart } from '@renderer/utils/getCarInfo'
import DoubleSessionLog from './DoubleSessionLog'

interface IData {
  CarData?: ICarData
  DriverList?: IDriverList
  TimingData?: ITimingData
  SessionInfo?: ISessionInfo
  SessionData?: ISessionData
}

const PracticeStartSessionLogs = (
  newLogs: ISessionLog[],
  data: IData,
  practiceStartDrivers: string[],
  setPracticeStartDrivers: React.Dispatch<React.SetStateAction<string[]>>,
  trackTimeUtc: number
) => {
  const { CarData, TimingData, DriverList } = data

  const dataPracticeStartDrivers = Object.keys(TimingData?.Lines ?? {}).filter((driver) =>
    isDoingPracticeStart(driver, CarData, TimingData)
  )

  if (dataPracticeStartDrivers.length > practiceStartDrivers.length) {
    setPracticeStartDrivers(dataPracticeStartDrivers)
    return [
      ...newLogs,
      ...dataPracticeStartDrivers
        .filter((driver) => !practiceStartDrivers.includes(driver))
        .map((driver) => {
          const { teamColour, driverName } = getDriverInfo(driver, DriverList)

          return {
            time: trackTimeUtc,
            key: driver + 'practiceStart',
            element: (
              <DoubleSessionLog
                title="Pitlane"
                color1={teamColour + sessionLogHexModifier}
                color2={Colors.green + sessionLogHexModifier}
                time={trackTimeUtc}
                left={driverName}
                right={'PRACTICE'}
                subInfo={'START'}
                data={data}
              />
            )
          }
        })
    ]
  } else if (dataPracticeStartDrivers.length < practiceStartDrivers.length)
    setPracticeStartDrivers(dataPracticeStartDrivers)

  return newLogs
}

export default PracticeStartSessionLogs
