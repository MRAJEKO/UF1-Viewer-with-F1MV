import Windows from '../components/Home/Windows/Windows'
import Tools from '../components/Home/Tools/Tools'

const HomePage = () => {
  function show(id: string) {
    return () => {
      console.log(id)
    }
  }

  function restoreAll() {
    console.log('restoreAll')
  }

  return (
    <div className={'background '}>
      <Windows />
      <Tools openLayouts={show('layouts')} restoreAll={restoreAll} settings={show('settings')} />
    </div>
  )
}

export default HomePage
