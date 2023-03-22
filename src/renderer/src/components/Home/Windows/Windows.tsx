import Window from './Window'
import NewWindowSection from './NewWindowSection'
import styles from './Windows.module.css'
import colors from '../../../assets/Colors.module.css'

import { connectionStatuses } from '../../../scripts/connectionStatuses'

function launchF1MV() {
  console.log('launchF1MV')
}

const Windows = () => {
  const statuses = connectionStatuses()

  console.log(statuses)

  return (
    <section className={colors['background-black']}>
      <h1>Ultimate Formula 1 Viewer</h1>
      <p style={{ color: 'white' }}>
        MultiViewer Status: {statuses.multiViewer ? 'CONNECTED' : 'DISCONNECTED'}
      </p>
      <p style={{ color: 'white' }}>
        Live Timing Status: {statuses.liveTiming ? 'CONNECTED' : 'DISCONNECTED'}
      </p>
      <Window onPress={launchF1MV} name="MultiViewer" />
      <Window onPress={launchF1MV} name="Live Timing" />
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
