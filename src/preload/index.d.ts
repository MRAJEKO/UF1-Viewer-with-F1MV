import { ElectronAPI } from '@electron-toolkit/preload'
import { Config, Topic, ClockTopic } from 'npm_f1mv_api'

interface IPoint {
  angle: number
  length: number
  number: number
  trackPosition: { x: number; y: number }
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    ipcRenderer: {
      send: (channel: string, data: any) => void
      on: (channel: string, func: any) => void
      invoke: (channel: string, data?: any) => Promise<any>
      sendSync: (channel: string, key: any) => any
    }
    shell: {
      openExternal: (url: string) => void
    }
    mvApi: {
      LiveTimingAPIGraphQL: (config: Config, topics: Topic[]) => Promise<any>
      discoverF1MVInstances: (host: string) => Promise<any>
      getCircuitInfo: (
        circuitId: number,
        year: Year
      ) => Promise<{
        corners: IPoint[]
        marshalLights: IPoint[]
        marshalSectors: IPoint[]
        rotation: number
        x: number[]
        y: number[]
        year: Year
      }>
      LiveTimingClockAPIGraphQL: (config: Config, topics: ClockTopic[]) => Promise<any>
      customGraphQL: (
        config: Config,
        body: object,
        variables: object,
        operationName: string
      ) => Promise<any>
      getAllPlayers: (config: Config) => Promise<any>
      setMutedPlayer: (config: Config, mutedPlayer: string, state: boolean) => Promise<any>
      setVolumePlayer: (config: Config, volumePlayer: string, volume: number) => Promise<any>
    }
    Govee: {
      newDevice: () => Promise<any>
    }
  }
}
