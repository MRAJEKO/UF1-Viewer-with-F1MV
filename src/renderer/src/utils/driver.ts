import {
  ICarData,
  ILapCount,
  ISector,
  ISessionInfo,
  ISessionStatusStatus,
  ITimingData,
  ITimingDataLine,
  ITimingStats,
  ITrackStatusStatus
} from '@renderer/types/LiveTimingStateTypes'
import { parseLapOrSectorTime } from './convertTime'
import { overwriteCrashedStatus } from '@renderer/components/AutoSwitcher/driverPriority'
import { weirdCarBehaviour } from './getCarInfo'

export const firstSectorCompleted = (sectors: ISector[]) => {
  const lastSector = sectors.slice(-1)[0]

  return sectors[0].Segments
    ? (sectors[0].Segments.slice(-1)[0].Status !== 0 && lastSector.Value === '') ||
        (lastSector.Segments?.slice(-1)[0].Status === 0 &&
          lastSector.Value !== '' &&
          sectors[1].Segments?.[0].Status !== 0 &&
          sectors[0].Segments.slice(-1)[0].Status !== 0)
    : sectors[0].Value !== '' && lastSector.Value === ''
}

export const isDriverOnPushLap = (
  driverNumber: string,
  sessionStatus?: ISessionStatusStatus,
  trackStatus?: ITrackStatusStatus,
  timingData?: ITimingData,
  bestTimes?: ITimingStats,
  sessionType?: ISessionInfo['Type']
) => {
  // If session inactive
  if (
    sessionStatus === 'Aborted' ||
    sessionStatus === 'Inactive' ||
    (trackStatus && ['4', '5', '6', '7'].includes(trackStatus))
  )
    return false

  const driverTimingData = timingData?.Lines?.[driverNumber]
  const driverBestTimes = bestTimes?.Lines?.[driverNumber]

  if (!driverTimingData || !driverBestTimes) return false

  // If race completed
  if (
    sessionType === 'Race' &&
    (driverTimingData.NumberOfLaps === undefined || driverTimingData.NumberOfLaps <= 1)
  )
    return false

  if (driverTimingData.InPit) return false

  // If on an outlap
  if (driverTimingData.Sectors[0].Segments?.[0].Status === 2064 || driverTimingData.PitOut)
    return false

  // Get the threshold to which the sector time should be compared to the best personal sector time.
  const pushDeltaThreshold = sessionType === 'Race' ? 0.2 : sessionType === 'Qualifying' ? 1 : 3

  const sectors = driverTimingData.Sectors

  if (
    sectors.slice(-1)[0].Value !== '' &&
    (sectors.slice(-1)[0].Segments?.slice(-1)[0].Status !== 0 ?? true)
  )
    return false

  const completedFirstSector = firstSectorCompleted(sectors)

  let isPushing = false
  for (let sectorIndex = 0; sectorIndex < driverTimingData.Sectors.length; sectorIndex++) {
    const sector = sectors[sectorIndex]
    const bestSector = driverBestTimes.BestSectors[sectorIndex]

    const sectorTime = parseLapOrSectorTime(sector.Value)
    const bestSectorTime = parseLapOrSectorTime(bestSector.Value)

    // If first sector is too slow compared to the threshold
    if (sectorTime - bestSectorTime > pushDeltaThreshold && completedFirstSector) {
      isPushing = false
      break
    }

    // If first sector time is faster then the threshold it should temporarily set pushing to true because the driver could have still backed out in a later stage
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

export const getTargetData = (
  driverNumber: string,
  timingData?: ITimingData,
  sessionType?: ISessionInfo['Type'],
  timingStats?: ITimingStats
) => {
  const driverTimingData = timingData?.Lines?.[driverNumber]

  const position = parseInt(driverTimingData?.Position ?? '0')

  const fallbackPosition = position == 1 ? 2 : 1

  const targetPosition = (() => {
    if (sessionType === 'Practice') return fallbackPosition

    if (sessionType === 'Qualifying') {
      const sessionPart = timingData?.SessionPart ?? 1

      const currentEntries = timingData?.NoEntries?.[sessionPart] ?? null

      const cutoff = currentEntries ? position > currentEntries : false

      if (!cutoff || !currentEntries) return fallbackPosition

      for (let driverPosition = currentEntries; driverPosition > 0; driverPosition--) {
        const driverData = Object.values(timingData?.Lines ?? {}).find(
          (data) => parseInt(data.Position) === driverPosition
        )

        if (driverData?.BestLapTime?.Value !== '') return driverPosition
      }

      return fallbackPosition
    } else {
      for (const driver in timingStats) {
        const driverBestLapPosition = timingStats?.[driver].PersonalBestLapTime.Position

        if (driverBestLapPosition === 1) {
          return timingData?.Lines?.[driver]?.Position ?? fallbackPosition
        }
      }

      return fallbackPosition
    }
  })()

  const targetData = Object.values(timingData?.Lines ?? {})?.find(
    (line) => line?.Position == targetPosition
  )

  return targetData?.RacingNumber
}

export const isDriverInDanger = (
  driverNumber: string,
  timingData?: ITimingData,
  sessionType?: ISessionInfo['Type']
) => {
  if (sessionType !== 'Qualifying') return false

  const driverTimingData = timingData?.Lines?.[driverNumber]

  const position = parseInt(driverTimingData?.Position ?? '1')

  const sessionPart = timingData?.SessionPart ?? 1

  const currentEntries = timingData?.NoEntries?.[sessionPart] ?? null

  const cutoff = currentEntries !== null ? position > currentEntries : false

  return cutoff
}

export const lapCompleted = (driverTimingData?: ITimingDataLine) => {
  if (!driverTimingData) return false

  const minisectors = !!driverTimingData.Sectors[0].Segments

  if (minisectors) {
    const lastSector = driverTimingData.Sectors.slice(-1)[0]

    if (lastSector?.Segments?.some((segment) => segment.Status === 2064)) return false

    return lastSector.Segments?.slice(-1)[0].Status !== 0 && lastSector.Value !== ''
  }

  return driverTimingData.Sectors.slice(-1)[0].Value !== ''
}
