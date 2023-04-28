import { useState, useEffect } from 'react'

export function liveSession() {
  const [liveSessionInfo, setLiveSessionInfo] = useState<any>({})

  useEffect(() => {
    async function fetchStatus() {
      try {
        const link =
          (await window.ipcRenderer.invoke('get-store'))?.internal_settings?.session
            ?.getLiveSession ?? null

        if (!link) return

        window.ipcRenderer.invoke('clear-cache')

        const response = await (await fetch(link)).json()

        if (JSON.stringify(response) === JSON.stringify(liveSessionInfo)) return

        setLiveSessionInfo(response)
      } catch (error) {
        console.log(error)
      }
    }

    fetchStatus()
    const intervalId = setInterval(fetchStatus, 15000)

    return () => clearInterval(intervalId)
  }, [liveSessionInfo])

  return liveSessionInfo
}
