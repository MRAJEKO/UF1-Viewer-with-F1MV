import { useState } from 'react'
import Connections from '../components/Home/Connections/Connections'
import Windows from '../components/Home/Windows/Windows'
import Tools from '../components/Home/Tools/Tools'
import { connectionStatuses } from '../utils/connectionStatuses'

const HomePage = () => {
  const [extended, setExtended] = useState(true)

  if (extended) {
    const statuses = connectionStatuses()

    console.log(statuses)

    if (statuses.multiViewer && statuses.liveTiming) {
      setExtended(false)
    }
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
    setExtended(false)
  }

  return (
    <div className={'background '}>
      <Connections extended={extended} closeConnections={closeConnections} />
      <Windows />
      <Tools openLayouts={show('layouts')} restoreAll={restoreAll} settings={show('settings')} />
    </div>
  )
}

export default HomePage
