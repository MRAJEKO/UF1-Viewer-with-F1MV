export interface Color {
  name: string
}

export interface Colors {
  [key: string]: string
}

export interface LedColors {
  [key: string]: [number, number, number]
}

export const ledColors: LedColors = window.ipcRenderer.sendSync('get-store', 'colors')?.leds ?? {}

export const sessionLogHexModifier: string =
  window.ipcRenderer.sendSync('get-store', 'colors')?.sessionLogHexModifier ?? ''

export default window.ipcRenderer.sendSync('get-store', 'colors')?.general ?? ({} as Colors)
