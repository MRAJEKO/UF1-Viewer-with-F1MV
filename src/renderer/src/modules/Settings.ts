export const goveeEnabled: boolean =
  window.ipcRenderer.sendSync('get-store', 'config')?.flag_display?.settings?.govee.value ?? false

interface IOption {
  value: string | null
  title: string
}

interface ISetting {
  title: string
  description: string
  type: string
  value: boolean | string | number | [number | null, number | null, number | null]
  options?: [IOption[], IOption[], IOption[]]
}

interface ISettingNumber extends ISetting {
  type: 'number'
  value: number
}

// interface ISettingString extends ISetting {
//   type: 'string'
//   value: string
// }

interface ISettingBoolean extends ISetting {
  type: 'boolean'
  value: boolean
}

interface INumberArray extends ISetting {
  type: 'multiselect'
  value: [number | null, number | null, number | null]
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

interface ITeamRadioSettings {
  name: string
  settings: {
    always_on_top: ISettingBoolean
    autoplay: ISettingBoolean
    hide_footer: ISettingBoolean
    minimize_animations: ISettingBoolean
    volume_change_percentage: ISettingNumber
    pause_keybind: INumberArray
  }
}

export const sessionLogSettings: ISessionLogSettings | null =
  window.ipcRenderer.sendSync('get-store', 'config')?.session_log ?? null

export const trackInfoSettings: ITrackInfoSettings | null =
  window.ipcRenderer.sendSync('get-store', 'config')?.trackinfo ?? null

export const singlercmSettings: ISinglercmSettings | null =
  window.ipcRenderer.sendSync('get-store', 'config')?.singlercm ?? null

export const teamRadioSettings: ITeamRadioSettings | null =
  window.ipcRenderer.sendSync('get-store', 'config')?.teamradios ?? null
