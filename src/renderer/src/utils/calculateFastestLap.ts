import { ITimingStats } from '@renderer/types/LiveTimingStateTypes'

export const calculateFastestLap = (data: ITimingStats | undefined) =>
  Object.values(data?.Lines ?? {}).find((line) => line.PersonalBestLapTime.Position === 1)
    ?.PersonalBestLapTime.Value
