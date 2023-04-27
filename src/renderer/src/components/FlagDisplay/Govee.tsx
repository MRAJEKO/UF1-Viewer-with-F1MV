import { useEffect, useState } from 'react'

interface GoveeProps {
  status: boolean
  colors: Array<string | null>
}

const GoveeIntegration = ({ status, colors }: GoveeProps) => {
  const [goveeDevices, setGoveeDevices] = useState<any[]>([])

  useEffect(() => {
    window.Govee.newDevice()
      .then((device) => {
        console.log(device)
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  const setGoveeLight = async (color) => {
    const ledColors = (await window.ipcRenderer.invoke('get_store')).led_colors
    const rgbColor = ledColors[color]

    console.log('Set govee light to: ' + color)

    console.log(goveeDevices)
    for (const device of goveeDevices) {
      await device.actions.fadeColor({
        time: 500,
        color: {
          rgb: rgbColor
        },
        brightness: 100
      })
    }
  }

  return status ? (
    <div style={{ zIndex: 3, color: 'blue' }}>{colors.find((color) => color !== null ?? null)}</div>
  ) : null
}

export default GoveeIntegration
