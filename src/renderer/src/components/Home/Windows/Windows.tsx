import { useEffect, useRef } from 'react'
import Window from './Window'
import NewWindowSection from './NewWindowSection'
import LiveTimingWindow from './LiveTimingWindow'
import { liveSession } from '../../../utils/liveSession'
import { connectionStatuses } from '../../../utils/connectionStatuses'
import styles from './Windows.module.css'
import colors from '../../../assets/Colors.module.css'

const Windows = () => {
  const liveSessionInfo = liveSession()

  const statuses = connectionStatuses()

  console.log(statuses)

  const multiViewerConnectedRef = useRef(statuses.multiViewer)

  useEffect(() => {
    multiViewerConnectedRef.current = statuses.multiViewer
  }, [statuses.multiViewer])

  console.log(multiViewerConnectedRef)

  async function launchF1MV() {
    const multiViewerLink: string = (await window.ipcRenderer.invoke('get-store')).internal_settings
      .multiviewer.app.link
    console.log('Opening MultiViewer for F1')
    window.shell.openExternal(multiViewerLink)
  }

  async function liveTiming() {
    // const isLiveSession = liveSessionInfo.liveSessionFound

    const isLiveSession = true

    if (isLiveSession) {
      if (!multiViewerConnectedRef.current) await launchF1MV()

      const interval = setInterval(async () => {
        console.log(multiViewerConnectedRef.current)
        if (multiViewerConnectedRef.current) {
          const liveTimingLink: string = (await window.ipcRenderer.invoke('get-store'))
            .internal_settings.multiviewer.livetiming.link

          window.shell.openExternal(liveTimingLink)

          clearInterval(interval)
        }
      }, 500)
    }
  }

  function openWindow(name: string) {
    window.ipcRenderer.invoke('openWindow', name)
  }

  return (
    <section className={colors['background-black']}>
      <h1>Ultimate Formula 1 Viewer</h1>
      <Window onPress={launchF1MV} name="MultiViewer" />
      <LiveTimingWindow onPress={liveTiming} name="Live Timing" />
      <Window onPress={launchF1MV} name="Flag Display" />
      <Window onPress={launchF1MV} name="Delayed Track Time" />
      <Window onPress={launchF1MV} name="Session Log" />
      <Window onPress={launchF1MV} name="Track Information" />
      <Window onPress={launchF1MV} name="Sector Statuses" />
      <Window onPress={launchF1MV} name="Single Race Control Message" />
      <Window onPress={launchF1MV} name="Crash Detection" />
      <Window onPress={launchF1MV} name="Track Rotation Compass" />
      <Window onPress={launchF1MV} name="Tire Statistics" />
      <Window onPress={launchF1MV} name="Push Lap Detection" />
      <Window onPress={launchF1MV} name="Battle Mode" />
      <Window onPress={launchF1MV} name="Weather Information" />
      <NewWindowSection name="BETA" />
      <Window onPress={launchF1MV} name="Auto Onboard Camera Switcher" type="beta" />
    </section>
  )
}

export default Windows
