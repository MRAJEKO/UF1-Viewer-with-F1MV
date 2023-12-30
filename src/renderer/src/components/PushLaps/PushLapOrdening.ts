import { IDriversInfo } from '@renderer/pages/PushLaps'
import { ITimingData } from '@renderer/types/LiveTimingStateTypes'

// Get the position of the driver based on their segments
function getDriverPosition(driverNumber: string, timingData: ITimingData) {
  const driverTimingData = timingData.Lines?.[driverNumber]
  const sectors = driverTimingData?.Sectors

  if (!sectors) return 0

  // The starting segment will always be 0 because if there is no 0 state anywhere all segments will be completed and the current segment will be the first one.
  let currentSegment = -1

  const driverCount = Object.keys(timingData.Lines ?? {}).length

  if (sectors[0].Segments) {
    for (const sectorIndex in sectors) {
      const segments = sectors[sectorIndex].Segments
      for (const segmentIndex in segments) {
        const segment = segments[segmentIndex]
        if (segment.Status === 0) return currentSegment + parseInt(segmentIndex)
      }
      currentSegment += segments?.length ?? 0
    }
  } else {
    currentSegment = driverCount - parseInt(driverTimingData.Position)
  }

  const lastSectorValue = sectors.slice(-1)[0].Value

  if (lastSectorValue === '') return currentSegment

  return 0
}

export const getDriversTrackOrder = (
  pushDrivers: string[],
  drivers: IDriversInfo,
  timingData?: ITimingData
) => {
  if (!timingData) return pushDrivers
  const driverOrder = pushDrivers.sort((a, b) => {
    return drivers[a].lapStartTime && drivers[b].lapStartTime
      ? (drivers[a].lapStartTime ?? 0) - (drivers[b].lapStartTime ?? 0)
      : getDriverPosition(b, timingData) - getDriverPosition(a, timingData)
  })

  return driverOrder
}

export const filterPushDrivers = (pushDrivers: string[]) => pushDrivers
