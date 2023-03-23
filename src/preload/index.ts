import { contextBridge, ipcRenderer, shell } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { discoverF1MVInstances } from 'npm_f1mv_api'

// Custom APIs for renderer
const api = {}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
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
    ipcRenderer.on(channel, (event, ...args) => func(...args))
  },
  invoke: (channel: string, data?: any) => ipcRenderer.invoke(channel, data)
})

contextBridge.exposeInMainWorld('shell', {
  openExternal: (url: string) => shell.openExternal(url)
})

contextBridge.exposeInMainWorld('discoverF1MVInstances', (host: string) =>
  discoverF1MVInstances(host)
)
