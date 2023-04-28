import { contextBridge, ipcRenderer, shell } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  LiveTimingAPIGraphQL,
  discoverF1MVInstances,
  LiveTimingClockAPIGraphQL,
  Config,
  Topic,
  ClockTopic
} from 'npm_f1mv_api'

import Govee from 'govee-lan-control'

const api = {}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel: string, data: any) => ipcRenderer.send(channel, data),
  on: (channel: string, func: any) => {
    ipcRenderer.on(channel, (_event, ...args) => func(...args))
  },
  invoke: (channel: string, data?: any) => ipcRenderer.invoke(channel, data)
})

contextBridge.exposeInMainWorld('shell', {
  openExternal: (url: string) => shell.openExternal(url)
})

contextBridge.exposeInMainWorld('mvApi', {
  LiveTimingAPIGraphQL: (config: Config, topics: Topic[]) => LiveTimingAPIGraphQL(config, topics),
  discoverF1MVInstances: (host: string) => discoverF1MVInstances(host),
  LiveTimingClockAPIGraphQL: (config: Config, topics: ClockTopic[]) =>
    LiveTimingClockAPIGraphQL(config, topics)
})

contextBridge.exposeInMainWorld('Govee', {
  newDevice: async () => {
    const govee = new (Govee as any).default()

    return new Promise<void>((resolve) => {
      govee.on('deviceAdded', (device: any) => {
        resolve(device)
      })
    })
  }
})
