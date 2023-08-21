interface IPlayerState {
  ts: number
  paused: boolean
  muted: boolean
  volume: number
  live: boolean
  currentTime: number
  interpolatedCurrentTime: number
}

interface IPlayerDriverData {
  driverNumber: number
  tla: string
  firstName: string
  lastName: string
  teamName: string
}

interface IPlayerStreamData {
  contentId: number | string
  meetingKey: string
  sessionKey: string
  channelId: number
  title: string
}

export interface IPlayerBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface IPlayer {
  id: string
  type: 'ADDITIONAL' | 'OBC'
  state: IPlayerState
  driverData: IPlayerDriverData | null
  streamData: IPlayerStreamData
  bounds: IPlayerBounds
  fullscreen: boolean
  alwaysOnTop: boolean
  maintainAspectRatio: boolean
}

export type TPlayers = IPlayer[]
