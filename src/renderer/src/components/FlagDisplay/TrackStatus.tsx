import { useEffect, useState } from 'react'
import styles from './Panels.module.css'

interface TrackStatusProps {
  status: number | null
}

interface Colors {
  [key: string]: string
}

const TrackStatus = ({ status }: TrackStatusProps) => {
  const [color, setColor] = useState('black')
  const [colors, setColors] = useState<Colors>({})

  useEffect(() => {
    const getColors = async () => {
      const data = (await window.ipcRenderer.invoke('get-store'))?.colors ?? {}
      setColors(data)
    }

    getColors()
  })

  const changeColor = (color: string) => {
    console.log(colors)
    if (colors?.general[color]) setColor(colors.general[color])
    else setColor('black')
  }

  useEffect(() => {
    const blinkYellow = async (duration, count) => {
      for (let i = 0; i < count; i++) {
        changeColor('yellow')
        await new Promise((resolve) => setTimeout(resolve, duration))
        changeColor('black')
        await new Promise((resolve) => setTimeout(resolve, duration))
      }
    }

    switch (status) {
      case 1:
        changeColor('green')
        setTimeout(() => {
          changeColor('black')
        }, 5000)
        break
      case 2:
        changeColor('yellow')
        break
      case 4:
        blinkYellow(500, 5)
        break
      case 5:
        changeColor('red')
        break
      case 6:
      case 7:
        blinkYellow(1000, 3)
        break
    }
  }, [status])

  return <div className={styles['panel']} style={{ backgroundColor: color }}></div>
}

export default TrackStatus
