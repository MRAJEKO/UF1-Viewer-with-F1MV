import styles from './Connections.module.css'
import NewWindowSection from '../Windows/NewWindowSection'
import Window from '../Windows/Window'
import { launchF1MV } from '../../../utils/launchF1MV'
import LiveTimingWindow from '../Windows/LiveTimingWindow'
import Connection from './Connection'
import { liveSession } from '../../../utils/liveSession'

interface ConnectionsProps {
  extended?: boolean
  closeConnections: () => void
}

const Connections = ({ extended = false, closeConnections }: ConnectionsProps) => {
  const liveSessionInfo = liveSession()
  const isSessionLive = liveSessionInfo.streamInfo?.liveTimingAvailable

  return (
    <section className={`${extended && styles.extended} ${styles.connections}`}>
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
          {!isSessionLive && (
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
