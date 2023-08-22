import {
  ICarData,
  ISessionInfo,
  ISessionStatusStatus,
  ITimingData,
  ITrackStatusStatus
} from '@renderer/types/LiveTimingStateTypes'

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

export const getCarData = (driverNumber: string | number, carData: ICarData) => {
  try {
    carData.Entries[0].Cars[driverNumber].Channels
  } catch (error) {
    return 'error'
  }
  return carData.Entries[0].Cars[driverNumber].Channels
}

export const getSpeedThreshold = (
  sessionType: ISessionInfo['Type'],
  sessionStatus: ISessionStatusStatus,
  trackStatus: ITrackStatusStatus
) => {
  if (
    sessionType === 'Qualifying' ||
    sessionType === 'Practice' ||
    trackStatus === '4' ||
    trackStatus === '6' ||
    trackStatus === '7'
  )
    return 10
  if (sessionStatus === 'Inactive' || sessionStatus === 'Aborted') return 0
  return 30
}

export const weirdCarBehaviour = (
  racingNumber: number | string,
  timingData: ITimingData,
  carData: ICarData,
  sessionType: ISessionInfo['Type'],
  sessionStatus: ISessionStatusStatus,
  trackStatus: ITrackStatusStatus
) => {
  const driverCarData = getCarData(racingNumber, carData)

  if (driverCarData === 'error') return false

  const driverTimingData = timingData.Lines[racingNumber]

  const rpm = driverCarData[0]

  const speed = driverCarData[2]

  const gear = driverCarData[3]

  const speedLimit = getSpeedThreshold(sessionType, sessionStatus, trackStatus)

  return (
    rpm === 0 ||
    speed <= speedLimit ||
    gear > 8 ||
    gear ===
      (sessionStatus === 'Inactive' ||
      sessionStatus === 'Aborted' ||
      (sessionType !== 'Race' && driverTimingData.PitOut)
        ? ''
        : 0)
  )
}
