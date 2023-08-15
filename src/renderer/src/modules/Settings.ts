export const goveeEnabled: boolean =
  window.ipcRenderer.sendSync('get-store', 'config')?.flag_display?.settings?.govee.value ?? false

interface ISetting {
  title: string
  description: string
  type: string
  value: boolean | string | number
}

interface ISettingNumber extends ISetting {
  type: 'number'
  value: number
}

interface ISessionLogSettings {
  name: string
  settings: {
    always_on_top: ISetting
    show_header: ISetting
    lapped_drivers: ISetting
    retired_drivers: ISetting
    rain: ISetting
    team_radios: ISetting
    pitstops: ISetting
    practice_starts: ISetting
    finished: ISetting
  }
}

interface ITrackInfoSettings {
  name: string
  settings: {
    always_on_top: ISetting
    orientation: ISetting
  }
}

interface ISinglercmSettings {
  name: string
  settings: {
    always_on_top: ISetting
    keep_on_display: ISetting
    display_duration: ISettingNumber
  }
}

export const sessionLogSettings: ISessionLogSettings | null =
  window.ipcRenderer.sendSync('get-store', 'config')?.session_log ?? null

export const trackInfoSettings: ITrackInfoSettings | null =
  window.ipcRenderer.sendSync('get-store', 'config')?.trackinfo ?? null

export const singlercmSettings: ISinglercmSettings | null =
  window.ipcRenderer.sendSync('get-store', 'config')?.singlercm ?? null
