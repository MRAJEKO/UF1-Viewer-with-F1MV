import { IRaceControlMessage, ISessionStatusStatus } from '@renderer/types/LiveTimingStateTypes'
import Colors from '@renderer/modules/Colors'

export const getPitExitStatus = (
  raceControlMessages: IRaceControlMessage[],
  SessionStatus: ISessionStatusStatus
) => {
  if (['Aborted', 'Inactive', 'Finalised'].includes(SessionStatus)) return false

  const reversedRaceControlMessages = [...raceControlMessages].reverse()

  const pitExitMessage = reversedRaceControlMessages.find((raceControlMessage) => {
    console.log(raceControlMessage)

    const category = raceControlMessage.SubCategory ?? raceControlMessage.Category

    return category === 'PitExit'
  })

  if (!pitExitMessage) return false

  return pitExitMessage.Flag === 'OPEN'
}

export const getPitEntryStatus = (raceControlMessages: IRaceControlMessage[]) => {
  const reversedRaceControlMessages = [...raceControlMessages].reverse()

  const pitEntryMessage = reversedRaceControlMessages.find((raceContolMessage) => {
    const category = raceContolMessage.SubCategory ?? raceContolMessage.Category

    return category === 'PitEntry'
  })

  if (!pitEntryMessage) return true

  return pitEntryMessage.Flag === 'OPEN'
}

export const getDrsStatus = (raceControlMessages: IRaceControlMessage[]) => {
  const reversedRaceControlMessages = [...raceControlMessages].reverse()

  const drsMessage = reversedRaceControlMessages.find(
    (raceControlMessage) => raceControlMessage.Category === 'Drs'
  )

  if (!drsMessage) return true

  return drsMessage?.Status === 'ENABLED'
}

export const getHeadPadding = (raceControlMessages: IRaceControlMessage[]) => {
  const reversedRaceControlMessages = [...raceControlMessages].reverse()

  const headPadding = reversedRaceControlMessages
    .find(
      (raceControlMessage) =>
        raceControlMessage.Category === 'Other' &&
        raceControlMessage.Message.includes('HEAD PADDING')
    )
    ?.Message.split('HEAD PADDING')[0]
    .trim()

  switch (headPadding) {
    case 'BLUE':
    case 'LIGHT BLUE':
    case 'PINK':
      return { headPadding, color: Colors[headPadding.toLowerCase().replace(/\s/g, '')] }
    default:
      return { headPadding: 'UNKNOWN', color: Colors.white }
  }
}

export const getLowGrip = (raceControlMessages: IRaceControlMessage[]) => {
  const reversedRaceControlMessages = [...raceControlMessages].reverse()

  return (
    reversedRaceControlMessages.find(
      (raceControlMessage) =>
        raceControlMessage.SubCategory === 'LowGripConditions' ||
        raceControlMessage.SubCategory === 'NormalGripConditions'
    )?.SubCategory === 'LowGripConditions'
  )
}
