import { ILiveTimingData } from '@renderer/pages/BattleMode'

export const sortDriversOnPosition = (
  drivers: string[],
  liveTimingData: ILiveTimingData | null
) => {
  if (!liveTimingData) return drivers

  return drivers.sort((a, b) => {
    const aPosition = liveTimingData.TimingData.Lines[a]?.Position
    const bPosition = liveTimingData.TimingData.Lines[b]?.Position

    if (!aPosition || !bPosition) return 0

    return parseInt(aPosition) - parseInt(bPosition)
  })
}
