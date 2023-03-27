interface CategoryProps {
  


let settings: string

window.ipcRenderer.invoke('get-store').then((event) => {
  liveSessionApiLink = event?.internal_settings?.session?.getLiveSession || undefined
})

interface SettingPartProps {
  id: string
  name: string
}

const SettingPart = ({ id, name }: SettingPartProps) => {
  return (
    <div className="setting-part" id={id}>
      <h1>{name}</h1>
      <div className="setting-part-settings">

      </div>
    </div>
  )
}

export default SettingPart
