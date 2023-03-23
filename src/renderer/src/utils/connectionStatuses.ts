import { useState, useEffect } from 'react'
import { LiveTimingClockAPIGraphQL } from 'npm_f1mv_api'

let host: string = 'localhost'

window.ipcRenderer.invoke('get-store').then((event) => {
  host = event?.config?.network?.host || 'localhost'
})

export interface connectionStatusesProps {
  multiViewer: boolean
  liveTiming: boolean
}

export function connectionStatuses(): connectionStatusesProps {
  const [connections, setConnections] = useState({
    multiViewer: false,
    liveTiming: false
  })

  useEffect(() => {
    async function fetchStatus() {
      try {
        if (!host) return

        const port = (await window.discoverF1MVInstances(host)).port

        const config = {
          host: host,
          port: port
        }

        const liveTiming = (await LiveTimingClockAPIGraphQL(config, 'liveTimingStartTime'))
          ?.liveTimingStartTime
          ? true
          : false

        setConnections({ multiViewer: true, liveTiming: liveTiming })
      } catch (error) {
        setConnections({ multiViewer: false, liveTiming: false })
      }
    }

    fetchStatus()
    const intervalId = setInterval(fetchStatus, 1000)

    return () => clearInterval(intervalId)
  }, [])

  return connections
}
