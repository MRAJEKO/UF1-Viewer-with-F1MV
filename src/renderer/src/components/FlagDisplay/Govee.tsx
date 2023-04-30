import { LedColors } from '@renderer/interfaces/Colors'
import { useEffect, useState } from 'react'
import styles from './Panels.module.css'

interface GoveeProps {
  colors: Array<string | null>
}

const GoveeIntegration = ({ colors }: GoveeProps) => {
  const [ledColors, setLedColors] = useState<LedColors>({})
  const [goveeDevices, setGoveeDevices] = useState<any[]>([])
  const [currentColor, setCurrentColor] = useState<string | null>(null)

  useEffect(() => {
    window.Govee.newDevice()
      .then((device) => {
        console.log('New device found!', device.model)
        setGoveeDevices((prev) => [...prev, device])
      })
      .catch((error) => {
        console.error(error)
      })
  }, [])

  useEffect(() => {
    window.ipcRenderer.invoke('get-store').then((data) => {
      setLedColors(data?.colors?.leds ?? {})
    })
  }, [])

  const setGoveeLight = async (color) => {
    if (currentColor === color) return

    setCurrentColor(color)

    const rgbColor = ledColors?.[color] ?? ledColors?.default ?? null

    if (!rgbColor || !ledColors) return

    console.log('Set govee lights to: ' + (color ?? 'default'))

    for (const device of goveeDevices) {
      await device.actions.fadeColor({
        time: 400,
        color: {
          rgb: rgbColor
        },
        brightness: 100
      })
    }
  }

  useEffect(() => {
    if (goveeDevices.length > 0) {
      setGoveeLight(colors.find((color) => color !== null ?? ledColors?.default ?? null) ?? null)
    }
  }, [colors])

  return <div className={styles.panel} style={{ zIndex: 3, color: 'blue' }}></div>
}

export default GoveeIntegration
