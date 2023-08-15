import { IRaceControlMessage } from '@renderer/types/LiveTimingStateTypes'

export const isWantedCategory = (
  raceControlMessage: IRaceControlMessage,
  wantedCategories: (IRaceControlMessage['SubCategory'] | IRaceControlMessage['Category'])[]
) => {
  const category = raceControlMessage.SubCategory ?? raceControlMessage.Category

  return wantedCategories.includes(category)
}

export const isWantedSingleRaceControlMessage = (message: IRaceControlMessage) => {
  const WANTED_CATEGORIES = [
    'Flag',
    'IncidentNoted',
    'IncidentUnderInvestigation',
    'IncidentNoFurtherInvestigation',
    'IncidentNoFurtherAction',
    'LapTimeDeleted',
    'OffTrackAndContinued',
    'SpunAndContinued',
    'MissedApex',
    'CarStopped',
    'LowGripConditions',
    'TimePenalty',
    'StopGoPenalty',
    'TrackTestCompleted',
    'TrackSurfaceSlippery',
    'SessionResume',
    'SessionStartDelayed',
    'SessionDurationChanged',
    'Correction',
    'Weather',
    'PitEntry',
    'PitExit',
    'NormalGripConditions',
    'SafetyCar',
    'Drs',
    'LappedCarsMayOvertake',
    'LappedCarsMayNotOvertake',
    'IncidentInvestigationAfterSession',
    'Other',
    'RecoveryVehicle'
  ]

  const WANTED_FLAGS = ['BLACK AND ORANGE', 'BLACK AND WHITE', 'CHEQUERED']

  const category = message.SubCategory ?? message.Category

  if (WANTED_CATEGORIES.includes(category)) {
    switch (category) {
      case 'Flag':
        return WANTED_FLAGS.includes(message.Flag)
      case 'SafetyCar':
        return message.Category === 'Other'
      default:
        return true
    }
  }
  return false

  // Safety Car is wanted if the main category is also SafetyCar
}
