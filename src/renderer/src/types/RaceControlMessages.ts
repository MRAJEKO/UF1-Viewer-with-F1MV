export type TRaceControlMessageCategory = 'Flag' | 'Other' | 'Drs' | 'CarEvent' | 'SafetyCar'

export type TRaceControlMessageSubCategory =
  | 'Drs'
  | 'Flag'
  | 'SessionStartDelayed'
  | 'SessionDurationChanged'
  | 'LapTimeDeleted'
  | 'LappedCarsMayOvertake'
  | 'LappedCarsMayNotOvertake'
  | 'NormalGripConditions'
  | 'OffTrackAndContinued'
  | 'SpunAndContinued'
  | 'MissedApex'
  | 'CarStopped'
  | 'SafetyCar'
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

export type TRaceControlMessageFlag = 'YELLOW' | 'CLEAR' | 'RED' | 'BLUE' | 'BLACK' | 'CHEQUERED'

export interface IRaceControlMessage {
  Utc: string
  Category: TRaceControlMessageCategory
  SubCategory?: TRaceControlMessageSubCategory
  Message: string
  Flag?: string
  Scope?: string
  Lap?: number
  Sector: number
  Status?: string
  Mode?: string
  RacingNumber?: string
}

export interface IRaceControlMessages {
  Messages: IRaceControlMessage[]
}
