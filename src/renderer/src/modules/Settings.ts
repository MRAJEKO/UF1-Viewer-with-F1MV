export const goveeEnabled: boolean =
  window.ipcRenderer.sendSync('get-store', 'config')?.flag_display?.settings?.govee.value ?? false

interface ISetting {
  title: string
  description: string
  type: string
  value: boolean | string | number
}

interface ISessionLog {
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

export const sessionLog: ISessionLog | null =
  window.ipcRenderer.sendSync('get-store', 'config')?.session_log ?? null
