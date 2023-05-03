import { ledColors } from '@renderer/modules/Colors'
import { useEffect, useState } from 'react'
import styles from './Panels.module.css'

interface GoveeProps {
  colors: Array<string | null>
}

const GoveeIntegration = ({ colors }: GoveeProps) => {
  const [goveeDevices, setGoveeDevices] = useState<any[]>([])
  const [currentColor, setCurrentColor] = useState<string | null>(null)

  const [displayDevices, setDisplayDevices] = useState<boolean>(false)

  useEffect(() => {
    window.Govee.newDevice()
      .then((device) => {
        console.log('New device found!', device.model)
        setGoveeDevices((prev) => [...prev, device])
        setDisplayDevices(true)
        setTimeout(() => {
          setDisplayDevices(false)
        }, 5000)
      })
      .catch((error) => {
        console.error(error)
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

  return (
    <div className={styles.goveePanel} style={{ zIndex: 3, opacity: displayDevices ? 1 : 0 }}>
      <p className={styles.title}>Connected:</p>
      <p className={styles.count}>{goveeDevices.length}</p>
    </div>
  )
}

export default GoveeIntegration
