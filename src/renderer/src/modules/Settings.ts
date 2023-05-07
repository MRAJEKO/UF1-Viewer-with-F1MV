export let goveeEnabled: boolean = false

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

export let sessionLog: ISessionLog | null = null

window.ipcRenderer
  .invoke('get-store')
  .then((data) => {
    goveeEnabled = data?.config?.flag_display?.settings?.govee.value ?? false
    sessionLog = data?.config?.session_log ?? null
  })
  .catch(console.error)
