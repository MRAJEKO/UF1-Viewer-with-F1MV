import { IRaceControlMessage } from '@renderer/types/LiveTimingStateTypes'

export const isWantedMessage = (
  raceControlMessage: IRaceControlMessage,
  wantedCategories: (IRaceControlMessage['SubCategory'] | IRaceControlMessage['Category'])[]
) => {
  const category = raceControlMessage.SubCategory ?? raceControlMessage.Category

  return wantedCategories.includes(category)
}
