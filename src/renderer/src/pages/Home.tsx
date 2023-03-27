import { useState } from 'react'
import Connections from '../components/Home/Connections/Connections'
import Windows from '../components/Home/Windows/Windows'
import Tools from '../components/Home/Tools/Tools'
import { connectionStatuses } from '../utils/connectionStatuses'
import Settings from '../components/Home/Settings/Settings'

const HomePage = () => {
  const [extended, setExtended] = useState(true)
  const [forceClosed, setForceClosed] = useState(false)

  const statuses = connectionStatuses()

  if (
    !forceClosed &&
    ((statuses.multiViewer && statuses.liveTiming && extended) ||
      (!statuses.multiViewer && !statuses.liveTiming && !extended))
  ) {
    setExtended(!extended)
  }

  function show(id: string) {
    return () => {
      console.log(id)
    }
  }

  function restoreAll() {
    console.log('restoreAll')
  }

  function closeConnections() {
    setForceClosed(true)
    setExtended(false)
  }

  return (
    <div className={'background '}>
      <Connections extended={extended} closeConnections={closeConnections} />
      <Windows />
      <Settings />
      <Tools openLayouts={show('layouts')} restoreAll={restoreAll} settings={show('settings')} />
    </div>
  )
}

export default HomePage
