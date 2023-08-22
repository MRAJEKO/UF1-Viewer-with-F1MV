import {
  ICarData,
  ILapCount,
  ISessionInfo,
  ISessionStatusStatus,
  ITimingData,
  ITimingStats,
  ITrackStatusStatus
} from '@renderer/types/LiveTimingStateTypes'
import { parseLapOrSectorTime } from './convertTime'
import { overwriteCrashedStatus } from '@renderer/components/AutoSwitcher/driverPriority'
import { weirdCarBehaviour } from './getCarInfo'

export const isDriverOnPushLap = (
  driverNumber: string,
  sessionStatus?: ISessionStatusStatus,
  trackStatus?: ITrackStatusStatus,
  timingData?: ITimingData,
  bestTimes?: ITimingStats,
  sessionType?: ISessionInfo['Type']
) => {
  if (
    sessionStatus === 'Aborted' ||
    sessionStatus === 'Inactive' ||
    (trackStatus && ['4', '5', '6', '7'].includes(trackStatus))
  )
    return false

  const driverTimingData = timingData?.Lines[driverNumber]
  const driverBestTimes = bestTimes?.[driverNumber]

  if (!driverTimingData || !driverBestTimes) return false

  if (
    sessionType === 'Race' &&
    (driverTimingData.NumberOfLaps === undefined || driverTimingData.NumberOfLaps <= 1)
  )
    return false

  if (driverTimingData.InPit) return false

  // If the first mini sector time is status 2064, meaning he is on a out lap, return false
  if (driverTimingData.Sectors[0].Segments?.[0].Status === 2064) return false

  // Get the threshold to which the sector time should be compared to the best personal sector time.
  const pushDeltaThreshold = sessionType === 'Race' ? 0.2 : sessionType === 'Qualifying' ? 1 : 3

  const sectors = driverTimingData.Sectors

  const lastSector = sectors.slice(-1)[0]

  if (
    sectors.slice(-1)[0].Value !== '' &&
    (sectors.slice(-1)[0].Segments?.slice(-1)[0].Status !== 0 ?? true)
  )
    return false

  const completedFirstSector = sectors[0].Segments
    ? (sectors[0].Segments.slice(-1)[0].Status !== 0 && lastSector.Value === '') ||
      (lastSector.Segments.slice(-1)[0].Status === 0 &&
        lastSector.Value !== '' &&
        sectors[1].Segments[0].Status !== 0 &&
        sectors[0].Segments.slice(-1)[0].Status !== 0)
    : sectors[0].Value !== '' && lastSector.Value === ''

  let isPushing = false
  for (let sectorIndex = 0; sectorIndex < driverTimingData.Sectors.length; sectorIndex++) {
    const sector = sectors[sectorIndex]
    const bestSector = driverBestTimes.BestSectors[sectorIndex]

    const sectorTime = parseLapOrSectorTime(sector.Value)
    const bestSectorTime = parseLapOrSectorTime(bestSector.Value)

    // Check if the first sector is completed by checking if the last segment of the first sector has a value meaning he has crossed the last point of that sector and the final sector time does not have a value. The last check is done because sometimes the segment already has a status but the times are not updated yet.

    // If the first sector time is above the threshold it should imidiately break because it will not be a push lap
    if (sectorTime - bestSectorTime > pushDeltaThreshold && completedFirstSector) {
      isPushing = false
      break
    }

    // If the first sector time is lower then the threshold it should temporarily set pushing to true because the driver could have still backed out in a later stage
    if (sectorTime - bestSectorTime <= pushDeltaThreshold && completedFirstSector) {
      isPushing = true
      continue
    }

    // If the driver has a fastest segment overall it would temporarily set pushing to true because the driver could have still backed out in a later stage
    if (sector.Segments?.some((segment) => segment.Status === 2051) && sessionType !== 'Race') {
      isPushing = true
      continue
    }
  }

  // Return the final pushing state
  return isPushing
}

export const driverHasCrashed = (
  driverNumber: string,
  timingData?: ITimingData,
  carData?: ICarData,
  sessionType?: ISessionInfo['Type'],
  sessionStatus?: ISessionStatusStatus,
  trackStatus?: ITrackStatusStatus,
  lapCount?: ILapCount
) => {
  if (!timingData || !carData || !sessionType || !sessionStatus || !trackStatus || !lapCount)
    return false

  if (
    !weirdCarBehaviour(driverNumber, timingData, carData, sessionType, sessionStatus, trackStatus)
  )
    return false

  if (overwriteCrashedStatus(driverNumber, timingData, sessionType, sessionStatus, lapCount))
    return false

  return true
}
