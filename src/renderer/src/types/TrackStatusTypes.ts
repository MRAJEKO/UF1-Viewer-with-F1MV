export type TTrackStatusStatus = '1' | '2' | '3' | '4' | '5' | '6' | '7'

export type TTrackStatusMessage =
  | 'AllClear'
  | 'Yellow'
  | 'SCDeployed'
  | 'Red'
  | 'VSCDeployed'
  | 'VSCEnding'

export interface ITrackStatus {
  Status: TTrackStatusStatus
  Message: TTrackStatusMessage
}
