import { IRaceControlMessage, IRaceControlMessages } from '@renderer/types/LiveTimingStateTypes'

export const checkStartDelayed = (raceControlMessages: IRaceControlMessages | undefined) => {
  const startDelayed =
    raceControlMessages?.Messages.some(
      (raceControlMessage: IRaceControlMessage) =>
        raceControlMessage.SubCategory === 'SessionStartDelayed'
    ) || false
  return startDelayed ? true : false
}
