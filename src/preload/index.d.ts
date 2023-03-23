import { ElectronAPI } from '@electron-toolkit/preload'

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
    discoverF1MVInstances: (host: string) => Promise<{ port: number }>
  }
}
