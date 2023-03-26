export async function launchF1MV() {
  const multiViewerLink: string = (await window.ipcRenderer.invoke('get-store')).internal_settings
    .multiviewer.app.link
  console.log('Opening MultiViewer for F1')
  window.shell.openExternal(multiViewerLink)
}
