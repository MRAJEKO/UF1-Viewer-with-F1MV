import { speed11, speed12 } from '@renderer/constants/refreshIntervals'
import { useState, useEffect } from 'react'

export interface liveSession {
  sessionInfo: {
    sessionName: string
    sessionType: string
    Series: string
    trackName: string
    OBCAvailable: boolean
  }
  streamInfo: {
    liveTimingAvailable: boolean
    streamState: string
  }
  contentInfo: {
    contentId: string
  }
}

export interface liveSessionInfo {
  message: string
  liveSessionFound: boolean
  liveSessions: liveSession[]
  servedFrom: string
  status: number
}

const useLiveSession = () => {
  const [liveSessionLink, setLiveSessionLink] = useState<string>('')
  const [liveSessionInfo, setLiveSessionInfo] = useState<liveSessionInfo>({} as liveSessionInfo)
  const [loop, setLoop] = useState<number>(speed11)

  useEffect(() => {
    setLiveSessionLink(
      window.ipcRenderer.sendSync('get-store', 'internal_settings')?.session?.getLiveSession ?? null
    )
  }, [])

  useEffect(() => {
    async function fetchStatus() {
      try {
        if (!liveSessionLink) return

        await window.ipcRenderer.invoke('clear-cache')

        const response = await (await fetch(liveSessionLink)).json()

        console.log(response)

        if (JSON.stringify(response) === JSON.stringify(liveSessionInfo)) return

        setLiveSessionInfo(response)
      } catch (error) {
        console.log(error)
      }
    }

    fetchStatus()
    const intervalId = setInterval(fetchStatus, loop)

    return () => clearInterval(intervalId)
  }, [liveSessionLink, loop])

  const isLiveSession = liveSessionInfo?.liveSessions?.some(
    (liveSession: liveSession) =>
      liveSession.sessionInfo?.Series === 'FORMULA 1' && liveSession.streamInfo?.liveTimingAvailable
  )

  if (isLiveSession) setLoop(speed12)

  const prioritySession = liveSessionInfo?.liveSessions
    ?.filter((liveSession: liveSession) => liveSession.sessionInfo.Series === 'FORMULA 1')
    .sort((a: liveSession, b: liveSession) => {
      const sessionTypeOrder = {
        'post-race': 1,
        race: 2,
        'pre-race': 3
      }
      const sessionTypeA = (a.sessionInfo?.sessionType || '').toLowerCase()
      const sessionTypeB = (b.sessionInfo?.sessionType || '').toLowerCase()
      return (sessionTypeOrder[sessionTypeA] || 99) - (sessionTypeOrder[sessionTypeB] || 99)
    })[0]

  return { liveSessionInfo, isLiveSession, prioritySession }
}

export default useLiveSession
