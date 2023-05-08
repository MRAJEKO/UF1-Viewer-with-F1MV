export type TRaceControlMessageCategory = 'Flag' | 'Other' | 'Drs' | 'CarEvent' | 'SafetyCar'

export type TRaceControlMessageSubCategory =
  | 'Drs'
  | 'Flag'
  | 'SessionStartDelayed'
  | 'SessionDurationChanged'
  | 'LapTimeDeleted'
  | 'LapTimeReinstated'
  | 'LappedCarsMayOvertake'
  | 'LappedCarsMayNotOvertake'
  | 'NormalGripConditions'
  | 'OffTrackAndContinued'
  | 'SpunAndContinued'
  | 'MissedApex'
  | 'CarStopped'
  | 'SafetyCar'
  | 'MedicalCar'
  | 'VirtualSafetyCar'
  | 'IncidentNoted'
  | 'IncidentUnderInvestigation'
  | 'IncidentInvestigationAfterSession'
  | 'IncidentNoFurtherAction'
  | 'IncidentNoFurtherInvestigation'
  | 'TimePenalty'
  | 'StopGoPenalty'
  | 'TrackTestCompleted'
  | 'TrackSurfaceSlippery'
  | 'LowGripConditions'
  | 'Weather'
  | 'PitExit'
  | 'PitEntry'
  | 'SessionResume'
  | 'Correction'
  | 'RecoveryVehicle'

export type TRaceControlMessageFlag =
  | 'YELLOW'
  | 'DOUBLE YELLOW'
  | 'GREEN'
  | 'CHECKERED'
  | 'RED'
  | 'BLUE'
  | 'BLACK AND WHITE'
  | string

export type TRaceControlMessageScope = 'Track' | 'Sector' | 'Driver'

export type TRaceControlMessageStatus =
  | 'DEPLOYED'
  | 'ENDING'
  | 'DISABLED'
  | 'ENABLED'
  | 'IN THIS LAP'
  | 'THROUGH THE PIT LANE'

export interface IRaceControlMessage {
  Utc: string
  Category: TRaceControlMessageCategory
  SubCategory?: TRaceControlMessageSubCategory
  Message: string
  Flag?: TRaceControlMessageFlag
  Scope?: TRaceControlMessageScope
  Lap?: number
  Sector: number
  Status?: TRaceControlMessageStatus
  Mode?: string
  RacingNumber?: string
}

export interface IRaceControlMessages {
  Messages: IRaceControlMessage[]
}
