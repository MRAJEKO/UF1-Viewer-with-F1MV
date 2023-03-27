import { useRef, useEffect } from 'react'
import styles from './Windows.module.css'
import { connectionStatuses } from '../../../utils/connectionStatuses'
import { launchF1MV } from '../../../utils/launchF1MV'
import { liveSession } from '../../../utils/liveSession'

interface LiveTimingWindowProps {
  name: string
  type?: string
}

const LiveTimingWindow = ({ name, type }: LiveTimingWindowProps) => {
  const liveSessionInfo = liveSession()

  const statuses = connectionStatuses()

  const multiViewerConnectedRef = useRef(statuses.multiViewer)

  useEffect(() => {
    multiViewerConnectedRef.current = statuses.multiViewer
  }, [statuses.multiViewer])

  async function openLiveTiming() {
    const isLiveSession = liveSessionInfo.streamInfo?.liveTimingAvailable

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

  const isSessionLive = liveSessionInfo.streamInfo?.liveTimingAvailable

  return (
    <button
      className={`${styles.window} ${styles[`${type}-button`]} ${
        !isSessionLive && styles[`disabled`]
      }`}
      onClick={openLiveTiming}
    >
      {name}
    </button>
  )
}

export default LiveTimingWindow
