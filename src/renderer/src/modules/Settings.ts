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
  options?: [IOption[], IOption[], IOption[]] | IOption[]
}

interface ISettingNumber extends ISetting {
  type: 'number'
  value: number
}

interface ISettingText extends ISetting {
  type: 'text'
  value: string
}

interface ISettingSwitch extends ISetting {
  type: 'switch'
  value: boolean
}

interface INumberArray extends ISetting {
  type: 'multiselect'
  value: [number | null, number | null, number | null]
}

interface ISettingSelect extends ISetting {
  type: 'select'
  value: string
  options: IOption[]
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
    always_on_top: ISettingSwitch
    autoplay: ISettingSwitch
    hide_footer: ISettingSwitch
    minimize_animations: ISettingSwitch
    volume_change_percentage: ISettingNumber
    pause_keybind: INumberArray
  }
}

interface IWeatherSettings {
  name: string
  settings: {
    always_on_top: ISettingSwitch
    datapoints: ISettingNumber
    use_trackmap_rotation: ISettingSwitch
  }
}

interface IAutoSwitcherSettings {
  name: string
  settings: {
    always_on_top: ISettingSwitch
    main_window_name: ISettingSelect
    speedometer: ISettingSwitch
    fixed_drivers: ISettingText
  }
}

interface IGeneralSettings {
  name: string
  settings: {
    discord_rpc: ISettingSwitch
    await_session: ISettingSwitch
    highlighted_drivers: ISettingText
  }
}

export const generalSettings: IGeneralSettings | null =
  window.ipcRenderer.sendSync('get-store', 'config')?.general ?? null

export const sessionLogSettings: ISessionLogSettings | null =
  window.ipcRenderer.sendSync('get-store', 'config')?.session_log ?? null

export const trackInfoSettings: ITrackInfoSettings | null =
  window.ipcRenderer.sendSync('get-store', 'config')?.trackinfo ?? null

export const singlercmSettings: ISinglercmSettings | null =
  window.ipcRenderer.sendSync('get-store', 'config')?.singlercm ?? null

export const teamRadioSettings: ITeamRadioSettings | null =
  window.ipcRenderer.sendSync('get-store', 'config')?.teamradios ?? null

export const weatherSettings: IWeatherSettings | null =
  window.ipcRenderer.sendSync('get-store', 'config')?.weather ?? null

export const autoSwitcherSettings: IAutoSwitcherSettings | null =
  window.ipcRenderer.sendSync('get-store', 'config')?.autoswitcher ?? null
