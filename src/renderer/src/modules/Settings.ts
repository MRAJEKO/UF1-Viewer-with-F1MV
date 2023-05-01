export let goveeEnabled: boolean = false

window.ipcRenderer
  .invoke('get-store')
  .then((data) => {
    goveeEnabled = data?.config?.flag_display?.settings?.govee.value ?? false
  })
  .catch(console.error)
