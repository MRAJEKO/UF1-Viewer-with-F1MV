import Window from './Window'
import NewWindowSection from './NewWindowSection'
import SolidWindows from './SolidWindows'
import LiveTimingWindow from './LiveTimingWindow'
import { launchF1MV } from '../../../utils/launchF1MV'
import styles from './Windows.module.scss'

interface IWindowsProps {
  settingsExtended: boolean
}

const Windows = ({ settingsExtended }: IWindowsProps) => {
  function openWindow(name: string) {
    window.ipcRenderer.invoke('open-window', name)
  }

  return (
    <section style={{ height: settingsExtended ? 0 : '' }} className={styles['homepage-section']}>
      <h1>Ultimate Formula 1 Viewer</h1>
      <Window onPress={launchF1MV} name="MultiViewer" />
      <LiveTimingWindow name="Live Timing" type="default" />
      <Window onPress={() => openWindow('flag_display')} name="Flag Display" />
      <Window onPress={() => openWindow('tracktime')} name="Delayed Track Time" />
      <Window onPress={() => openWindow('sessiontimer')} name="Session Timer" />
      <Window onPress={() => openWindow('session_log')} name="Session Log*" />
      <Window onPress={() => openWindow('trackinfo')} name="Track Information*" />
      <Window onPress={launchF1MV} name="Sector Statuses**" />
      <Window onPress={launchF1MV} name="Single Race Control Message**" />
      <Window onPress={launchF1MV} name="Crash Detection**" />
      <Window onPress={launchF1MV} name="Track Rotation Compass**" />
      <Window onPress={launchF1MV} name="Tire Statistics**" />
      <Window onPress={launchF1MV} name="Current Push Laps**" />
      <Window onPress={() => openWindow('teamradios')} name="Team Radio's*" />
      <Window onPress={launchF1MV} name="Battle Mode**" />
      <Window onPress={launchF1MV} name="Weather Information**" />
      <NewWindowSection name="BETA" />
      <Window onPress={launchF1MV} name="Auto Onboard Camera Switcher**" type="beta" />
      <NewWindowSection name="SOLID COLORED WINDOWS" />
      <SolidWindows />
    </section>
  )
}

export default Windows
