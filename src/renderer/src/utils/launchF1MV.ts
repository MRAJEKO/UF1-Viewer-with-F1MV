export async function launchF1MV() {
  const multiViewerLink: string = window.ipcRenderer.sendSync('get-store', 'internal_settings')
    ?.multiviewer?.app?.link

  if (multiViewerLink) {
    console.log('Opening MultiViewer for F1')
    window.shell.openExternal(multiViewerLink)
  } else console.log("Couldn't find MultiViewer link")
}
