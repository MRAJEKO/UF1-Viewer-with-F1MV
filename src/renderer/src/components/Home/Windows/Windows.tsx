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
      <Window onPress={() => openWindow('session_log')} name="Session Log*" type="dev" />
      <Window onPress={() => openWindow('trackinfo')} name="Track Information" />
      <Window onPress={() => openWindow('sector_statuses')} name="Sector Statuses" />
      <Window onPress={() => openWindow('singlercm')} name="Single Race Control Message" />
      <Window onPress={launchF1MV} name="Crash Detection**" type="dev" />
      <Window onPress={launchF1MV} name="Track Rotation Compass**" type="dev" />
      <Window onPress={launchF1MV} name="Tire Statistics**" type="dev" />
      <Window onPress={launchF1MV} name="Current Push Laps**" type="dev" />
      <Window onPress={() => openWindow('teamradios')} name="Team Radio's" />
      <Window onPress={launchF1MV} name="Battle Mode**" type="dev" />
      <Window onPress={() => openWindow('weather')} name="Weather Information" />
      <NewWindowSection name="BETA" />
      <Window
        onPress={() => openWindow('autoswitcher')}
        name="Auto Onboard Camera Switcher*"
        type="dev"
      />
      <NewWindowSection name="SOLID COLORED WINDOWS" />
      <SolidWindows />
    </section>
  )
}

export default Windows
