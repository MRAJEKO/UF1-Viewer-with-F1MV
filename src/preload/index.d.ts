import { ElectronAPI } from '@electron-toolkit/preload'
import { Config, Topic, ClockTopic } from 'npm_f1mv_api'

declare global {
  interface Window {
    electron: ElectronAPI
    api: unknown
    ipcRenderer: {
      send: (channel: string, data: any) => void
      on: (channel: string, func: any) => void
      invoke: (channel: string, data?: any) => Promise<any>
    }
    shell: {
      openExternal: (url: string) => void
    }
    mvApi: {
      LiveTimingAPIGraphQL: (config: Config, topics: Topic[]) => Promise<any>
      discoverF1MVInstances: (host: string) => Promise<any>
      LiveTimingClockAPIGraphQL: (config: Config, topics: ClockTopic[]) => Promise<any>
      customGraphQL: (
        config: Config,
        body: object,
        variables: object,
        operationName: string
      ) => Promise<any>
    }
    Govee: {
      newDevice: () => Promise<any>
    }
  }
}
