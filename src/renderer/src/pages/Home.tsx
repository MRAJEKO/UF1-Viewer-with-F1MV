import Windows from '../components/Home/Windows/Windows'
import Tools from '../components/Home/Tools/Tools'
import Colors from '../assets/Colors.module.css'

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
    <div className={'background ' + Colors['background-black']}>
      <Windows />
      <Tools openLayouts={show('layouts')} restoreAll={restoreAll} settings={show('settings')} />
    </div>
  )
}

export default HomePage
