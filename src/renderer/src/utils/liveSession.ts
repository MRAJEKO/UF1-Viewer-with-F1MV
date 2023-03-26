import { useState, useEffect } from 'react'

let liveSessionApiLink: string

window.ipcRenderer.invoke('get-store').then((event) => {
  liveSessionApiLink = event?.internal_settings?.session?.getLiveSession || undefined
})

export function liveSession() {
  const [liveSessionInfo, setLiveSessionInfo] = useState<any>({})

  useEffect(() => {
    async function fetchStatus() {
      try {
        const response = await (await fetch(liveSessionApiLink)).json()

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
