export interface Color {
  name: string
}

export interface Colors {
  [key: string]: string
}

export interface LedColors {
  [key: string]: [number, number, number]
}

export let ledColors: LedColors = {}
export let colors: Colors = {}

window.ipcRenderer
  .invoke('get-store')
  .then((data) => {
    ledColors = data?.colors?.leds ?? {}
    colors = data?.colors?.general ?? {}
  })
  .catch(console.error)
