import { useRef, useEffect } from 'react'
import styles from './Windows.module.css'
import { connectionStatuses } from '../../../hooks/useConnectionStatuses'
import { launchF1MV } from '../../../utils/launchF1MV'
import useLiveSession from '../../../hooks/useLiveSession'

interface LiveTimingWindowProps {
  name: string
  type?: string
}

const LiveTimingWindow = ({ name, type }: LiveTimingWindowProps) => {
  const { isLiveSession } = useLiveSession()

  const statuses = connectionStatuses()

  const multiViewerConnectedRef = useRef(statuses.multiViewer)

  useEffect(() => {
    multiViewerConnectedRef.current = statuses.multiViewer
  }, [statuses.multiViewer])

  async function openLiveTiming() {
    console.log(isLiveSession)

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

  return (
    <button
      className={`${styles.window} ${styles[`${type}-button`]} ${
        !isLiveSession && styles[`disabled`]
      }`}
      onClick={openLiveTiming}
    >
      {name}
    </button>
  )
}

export default LiveTimingWindow
