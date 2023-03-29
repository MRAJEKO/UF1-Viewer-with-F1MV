import { useState } from 'react'
import Connections from '../components/Home/Connections/Connections'
import Windows from '../components/Home/Windows/Windows'
import Tools from '../components/Home/Tools/Tools'
import { connectionStatuses } from '../utils/connectionStatuses'
import Settings from '../components/Home/Settings/Settings'

const HomePage = () => {
  const [connectionsExtended, setConnectionsExtended] = useState(true)
  const [connectionsForceClosed, setConnectionsForceClosed] = useState(false)
  const [settingsExtended, setSettingsExtended] = useState(false)

  const statuses = connectionStatuses()

  if (
    !connectionsForceClosed &&
    ((statuses.multiViewer && statuses.liveTiming && connectionsExtended) ||
      (!statuses.multiViewer && !statuses.liveTiming && !connectionsExtended))
  ) {
    setConnectionsExtended(!connectionsExtended)
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
    setConnectionsForceClosed(true)
    setConnectionsExtended(false)
  }

  function toggleSettings() {
    setSettingsExtended(!settingsExtended)
  }

  function showLayouts() {
    console.log('showLayouts')
  }

  return (
    <div className={'background '}>
      <Connections extended={connectionsExtended} closeConnections={closeConnections} />
      <Windows />
      <Settings extended={settingsExtended} />
      <Tools openLayouts={showLayouts} restoreAll={restoreAll} settings={toggleSettings} />
    </div>
  )
}

export default HomePage
