import { ICarData, ITimingData } from '@renderer/types/LiveTimingStateTypes'

export const isDoingPracticeStart = (
  driver: string,
  CarData?: ICarData,
  TimingData?: ITimingData
) => {
  const driverTimingData = TimingData?.Lines[driver]

  if (!driverTimingData) return false

  const retired = driverTimingData.Retired || driverTimingData.Stopped

  const pitOut = TimingData?.Lines[driver].PitOut
  const carSpeed = CarData?.Entries?.[0]?.Cars?.[driver]?.Channels?.[2]

  return !retired && pitOut && carSpeed === 0
}
