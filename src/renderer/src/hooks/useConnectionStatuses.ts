import { useState, useEffect } from 'react'

const { LiveTimingClockAPIGraphQL, discoverF1MVInstances } = window.mvApi

let host: string = 'localhost'

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
      if (!localStorage.getItem('config'))
        host = window.ipcRenderer.sendSync('get-store', 'config')?.network?.host ?? 'localhost'

      try {
        if (!host) return

        const port = (await discoverF1MVInstances(host)).port

        const config = {
          host: host,
          port: port
        }

        localStorage.setItem('config', JSON.stringify(config))

        const liveTiming = (await LiveTimingClockAPIGraphQL(config, ['liveTimingStartTime']))
          ?.liveTimingStartTime
          ? true
          : false

        if (liveTiming != connections.liveTiming || connections.multiViewer != true) {
          setConnections({ multiViewer: true, liveTiming: liveTiming })
        }
      } catch (error) {
        if (connections.multiViewer !== false || connections.liveTiming !== false) {
          setConnections({ multiViewer: false, liveTiming: false })
        }
      }
    }

    fetchStatus()
    const intervalId = setInterval(fetchStatus, 1000)

    return () => clearInterval(intervalId)
  }, [connections])

  return connections
}
