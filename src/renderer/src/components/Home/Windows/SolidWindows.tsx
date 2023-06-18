import styles from './SolidWindows.module.scss'
import windowStyles from './Windows.module.scss'

import SolidWindow from './SolidWindow'

const SolidWindows = () => {
  function openWindow(color: string) {
    window.ipcRenderer.invoke('open-solid-window', color)
  }

  return (
    <div className={`${windowStyles.window} ${styles['solid-window-container']}`}>
      <SolidWindow onPress={() => openWindow('#808080')} color="#808080" />
      <SolidWindow onPress={() => openWindow('#1a1a1a')} color="#1a1a1a" />
      <SolidWindow onPress={() => openWindow('#000000')} color="#000000" />
      <SolidWindow onPress={() => openWindow('#ffffff')} color="#ffffff" />
    </div>
  )
}

export default SolidWindows
