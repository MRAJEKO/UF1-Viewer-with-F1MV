import { useState, useEffect } from 'react'

import { ipcRenderer } from 'electron'
import { discoverF1MVInstances, LiveTimingClockAPIGraphQL } from 'npm_f1mv_api'

let host: string = ''

// ipcRenderer.send('get-store', '')

// ipcRenderer.on('get-store-reply', (event, arg) => {
//   host = arg
// })

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

        const port = (await discoverF1MVInstances(host)).port

        const config = {
          host: host,
          port: port
        }

        console.log(config)

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
