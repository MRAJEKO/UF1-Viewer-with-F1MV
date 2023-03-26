import Window from './Window'
import NewWindowSection from './NewWindowSection'
import SolidWindows from './SolidWindows'
import LiveTimingWindow from './LiveTimingWindow'
import { launchF1MV } from '../../../utils/launchF1MV'

const Windows = () => {
  function openWindow(name: string) {
    window.ipcRenderer.invoke('open-window', name)
  }

  return (
    <section>
      <h1>Ultimate Formula 1 Viewer</h1>
      <Window onPress={launchF1MV} name="MultiViewer" />
      <LiveTimingWindow name="Live Timing" type="default" />
      <Window onPress={() => openWindow('flag_display')} name="Flag Display" />
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
      <NewWindowSection name="SOLID COLORED WINDOWS" />
      <SolidWindows />
    </section>
  )
}

export default Windows
