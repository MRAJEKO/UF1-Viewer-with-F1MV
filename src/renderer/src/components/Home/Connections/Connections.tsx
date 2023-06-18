import styles from './Connections.module.scss'
import NewWindowSection from '../Windows/NewWindowSection'
import Window from '../Windows/Window'
import { launchF1MV } from '../../../utils/launchF1MV'
import LiveTimingWindow from '../Windows/LiveTimingWindow'
import Connection from './Connection'
import useLiveSession from '../../../hooks/useLiveSession'
import windowsStyles from '../Windows/Windows.module.scss'

interface ConnectionsProps {
  extended?: boolean
  closeConnections: () => void
}

const Connections = ({ extended = false, closeConnections }: ConnectionsProps) => {
  const { isLiveSession } = useLiveSession()

  return (
    <section
      className={`${extended && styles.extended} ${styles.connections} ${
        windowsStyles['homepage-section']
      }`}
    >
      <div className={styles.container}>
        <h1 className={styles.title}>Ultimate Formula 1 Viewer</h1>
        <div className={styles.section}>
          <NewWindowSection name="STATUS" />
          <Connection name="MULTIVIEWER" checkType="multiViewer" />
          <Connection name="LIVE TIMING" checkType="liveTiming" />
        </div>
        <div className={styles.section}>
          <NewWindowSection name="CONTROLS" />
          <Window type="white" name="OPEN MULTIVIEWER" onPress={launchF1MV} />
          <LiveTimingWindow name="OPEN LIVE TIMING" type="white" />
          {!isLiveSession && (
            <p className={styles['livetiming-info']}>There is no live timing available.</p>
          )}
        </div>
        <button className={styles.continue} onClick={closeConnections}>
          CONTINUE ANYWAY
        </button>
      </div>
    </section>
  )
}

export default Connections