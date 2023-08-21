import { IList } from '@renderer/pages/AutoSwitcher'
import {
  ICarData,
  ILapCount,
  ISessionInfo,
  ISessionStatusStatus,
  ITimingData,
  ITrackStatusStatus
} from '@renderer/types/LiveTimingStateTypes'
import { weirdCarBehaviour } from '@renderer/utils/getCarInfo'

export const overwriteCrashedStatus = (
  driverNumber: string,
  TimingData: ITimingData,
  SessionType: ISessionInfo['Type'],
  SessionStatus: ISessionStatusStatus,
  LapCount: ILapCount
) => {
  const driverTimingData = TimingData?.Lines?.[driverNumber]

  if (!driverTimingData) return true

  if (driverTimingData.InPit || driverTimingData.Retired || driverTimingData.Stopped) return true

  const lastSectorSegments = driverTimingData.Sectors.slice(-1)[0].Segments

  const sessionInactive = SessionStatus === 'Inactive' || SessionStatus === 'Finished'

  if (!lastSectorSegments && sessionInactive) return true

  if (!lastSectorSegments) return false

  // Detect if grid start during inactive (formation lap) during a 'Race' session
  // If the final to last mini sector has a value (is not 0). Check if the session is 'Inactive' and if the session type is 'Race'
  if (
    SessionType === 'Race' &&
    (lastSectorSegments.slice(-3).some((segment) => segment.Status !== 0) ||
      driverTimingData.Sectors[0].Segments[1].Status === 0) &&
    LapCount?.CurrentLap === 1 &&
    !driverTimingData.PitOut
  ) {
    console.log(driverNumber + ' is on the starting grid')
    return true
  }

  // Detect if car is in parc ferme
  // If the car has stopped anywhere in the final sector and the 'race' has 'finished'
  if (
    SessionType === 'Race' &&
    SessionStatus === 'Finished' &&
    lastSectorSegments.some((segment) => segment.Status !== 0)
  ) {
    console.log(driverNumber + ' is in parc ferme')
    return true
  }

  return false
}

export const driverIsImportant = (
  driverNumber: string,
  TimingData?: ITimingData,
  CarData?: ICarData,
  SessionType?: ISessionInfo['Type'],
  SessionStatus?: ISessionStatusStatus,
  TrackStatus?: ITrackStatusStatus,
  LapCount?: ILapCount
) => {
  const driverTimingData = TimingData?.Lines?.[driverNumber]

  if (!driverTimingData) return false

  if (
    driverTimingData.InPit &&
    SessionType === 'Race' &&
    SessionStatus === 'Started' &&
    !driverTimingData.Retired &&
    !driverTimingData.Stopped
  )
    return true

  if (!CarData || !SessionType || !SessionStatus || !TrackStatus || !LapCount) return false

  if (
    !weirdCarBehaviour(driverNumber, TimingData, CarData, SessionType, SessionStatus, TrackStatus)
  )
    return false

  console.log(driverNumber + ' is important')

  if (overwriteCrashedStatus(driverNumber, TimingData, SessionType, SessionStatus, LapCount))
    return false

  return true
}

export const mvpDriver = (
  driverNumber: string,
  mvp: IList,
  setMvp: React.Dispatch<React.SetStateAction<IList>>,
  TimingData?: ITimingData,
  CarData?: ICarData,
  SessionType?: ISessionInfo['Type'],
  SessionStatus?: ISessionStatusStatus,
  TrackStatus?: ITrackStatusStatus,
  LapCount?: ILapCount
) => {
  const mvpLog = mvp

  if (SessionType === 'Race' && LapCount) {
    if (LapCount.CurrentLap === mvp.lap) {
      if (mvp.drivers.includes(driverNumber)) {
        return true
      }
    } else {
      setMvp({ lap: LapCount.CurrentLap, drivers: [] })
    }
  }

  const important = driverIsImportant(
    driverNumber,
    TimingData,
    CarData,
    SessionType,
    SessionStatus,
    TrackStatus,
    LapCount
  )

  if (important && SessionType === 'Race' && !mvpLog.drivers.includes(driverNumber)) {
    mvpLog.drivers.push(driverNumber)
  }

  return important
}

export const primaryDriver = (
  driverNumber: string,
  timingData?: ITimingData,
  lapCount?: ILapCount
) => {
  const driverIntervalAhead = timingData?.Lines?.[driverNumber]?.IntervalToPositionAhead?.Value

  if (!driverIntervalAhead) return false

  if (lapCount && lapCount.CurrentLap < 3) return true

  if (driverIntervalAhead !== '' && parseFloat(driverIntervalAhead.substring(1)) <= 1) return true

  return false
}

export const secondaryDriver = (
  driverNumber: string,
  timingData?: ITimingData,
  lapCount?: ILapCount
) => {
  const driverTimingData = timingData?.Lines?.[driverNumber]

  const driverIntervalAhead = driverTimingData?.IntervalToPositionAhead

  if (!driverIntervalAhead) return false

  if (
    driverIntervalAhead.Value != '' &&
    parseFloat(driverIntervalAhead.Value.substring(1)) > 1 &&
    driverIntervalAhead.Catching
  ) {
    // If the value to the car ahead is not nothing and is bigger than 1 second and the car is catching. The driver will then be a secondary driver (if it is after 3 laps from the start)
    if ((lapCount?.CurrentLap ?? 0) >= 3) {
      if (!driverIntervalAhead.Value.includes('LAP')) return true

      return false
    }
  }
  return false
}

export const tertiaryDriver = (
  driverNumber: string,
  timingData?: ITimingData,
  carData?: ICarData,
  sessionType?: ISessionInfo['Type'],
  lapCount?: ILapCount,
  sessionStatus?: ISessionStatusStatus
) => {
  const driverTimingData = timingData?.Lines?.[driverNumber]

  if (!driverTimingData) return false

  const driverIntervalAhead = driverTimingData?.IntervalToPositionAhead

  const driverCarData = carData?.Entries?.[0]?.Cars?.[driverNumber]

  if (!driverIntervalAhead || !driverCarData) return false

  if (sessionType !== 'Race') {
    // If the session is a Practice or Qualifying session
    if (driverTimingData.InPit && driverCarData.Channels[2] <= 5) return true

    return false
  }
  // If the value to the car ahead is not nothing or the gap is more than a second and he is not catching. The driver will then be a tertairy driver (if it is after 3 laps from the start)
  if (
    (driverIntervalAhead.Value.includes('LAP') ||
      (parseFloat(driverIntervalAhead.Value.substring(1)) > 1 && !driverIntervalAhead.Catching)) &&
    (lapCount?.CurrentLap ?? 0) >= 3
  ) {
    return true
  }

  if (
    sessionStatus &&
    lapCount &&
    sessionType === 'Race' &&
    driverTimingData.NumberOfLaps !== undefined
  ) {
    const numberOfLaps = driverIntervalAhead.Value.includes('L')
      ? parseInt(driverIntervalAhead.Value.split(' ')[0]) + driverTimingData.NumberOfLaps
      : driverTimingData.NumberOfLaps
    if (['Finished', 'Finalised'].includes(sessionStatus) && numberOfLaps === lapCount.CurrentLap)
      return true
  }

  return false
}

export const hiddenDriver = (
  driverNumber: string,
  timingData?: ITimingData,
  sessionType?: ISessionInfo['Type']
) => {
  const driverTimingData = timingData?.Lines?.[driverNumber]

  if (!driverTimingData || !sessionType) return true

  if (sessionType === 'Qualifying' && driverTimingData.KnockedOut) return true

  if (driverTimingData.Retired || driverTimingData.Stopped) return true

  return false
}
