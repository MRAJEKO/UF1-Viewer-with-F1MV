import { contextBridge, ipcRenderer, shell } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  LiveTimingAPIGraphQL,
  discoverF1MVInstances,
  LiveTimingClockAPIGraphQL,
  Config,
  Topic,
  ClockTopic,
  customGraphQL,
  getCircuitInfo,
  Year,
  getAllPlayers,
  setMutedPlayer,
  setVolumePlayer,
  setSpeedometerVisibility,
  getPlayerBounds,
  createPlayer,
  syncPlayers,
  setAlwaysOnTop,
  removePlayer,
  AlwaysOnTopLevel
} from 'npm_f1mv_api'

import Govee from 'govee-lan-control'
// import { autoUpdater } from 'electron-updater'
// import { AppUpdaterEvents } from 'electron-updater/out/AppUpdater'

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
  off: (channel: string, func: any) => {
    ipcRenderer.off(channel, (_event, ...args) => func(...args))
  },
  invoke: (channel: string, data?: any) => ipcRenderer.invoke(channel, data),
  sendSync: (channel: string, key: any) => ipcRenderer.sendSync(channel, key)
})

contextBridge.exposeInMainWorld('shell', {
  openExternal: (url: string) => shell.openExternal(url)
})

contextBridge.exposeInMainWorld('electronUpdater', {
  checkForUpdates: () => ipcRenderer.invoke('checkForUpdates'),
  downloadUpdate: () => ipcRenderer.invoke('downloadUpdate'),
  quitAndInstall: () => ipcRenderer.invoke('quitAndInstall')
  // on: (channel: keyof AppUpdaterEvents, func: any) => {
  //   autoUpdater.on(channel, (_event, ...args) => func(...args))
  // },
  // off: (channel: keyof AppUpdaterEvents, func: any) => {
  //   autoUpdater.off(channel, (_event, ...args) => func(...args))
  // }
})

contextBridge.exposeInMainWorld('mvApi', {
  LiveTimingAPIGraphQL: (config: Config, topics: Topic[]) => LiveTimingAPIGraphQL(config, topics),
  discoverF1MVInstances: (host: string) => discoverF1MVInstances(host),
  getCircuitInfo: (circuitId: number, year: Year) => getCircuitInfo(circuitId, year),
  LiveTimingClockAPIGraphQL: (config: Config, topics: ClockTopic[]) =>
    LiveTimingClockAPIGraphQL(config, topics),
  customGraphQL: (config: Config, body: object, variables: object, operationName: string) =>
    customGraphQL(config, body, variables, operationName),
  getAllPlayers: (config: Config) => getAllPlayers(config),
  setMutedPlayer: (config: Config, mutedPlayer: string, state: boolean) =>
    setMutedPlayer(config, mutedPlayer, state),
  setVolumePlayer: (config: Config, volumePlayer: string, volume: number) =>
    setVolumePlayer(config, volumePlayer, volume),
  setSpeedometerVisibility: (config: Config, id: number, visibility: boolean) =>
    setSpeedometerVisibility(config, id, visibility),
  getPlayerBounds: (config: Config, id: number) => getPlayerBounds(config, id),
  createPlayer: (
    config: Config,
    driverNumber: number,
    contentId: string | number,
    bounds: any,
    fullscreen: boolean
  ) => createPlayer(config, driverNumber, contentId, bounds, fullscreen),
  syncPlayers: (config: Config, mainWindow: number) => syncPlayers(config, mainWindow),
  setAlwaysOnTop: (config: Config, id: number, alwaysOnTop: boolean, level: AlwaysOnTopLevel) =>
    setAlwaysOnTop(config, id, alwaysOnTop, level),
  removePlayer: (config: Config, id: number) => removePlayer(config, id)
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
