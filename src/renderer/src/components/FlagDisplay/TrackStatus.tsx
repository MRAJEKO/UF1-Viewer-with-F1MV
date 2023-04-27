import { useEffect, useState } from 'react'
import styles from './Panels.module.css'
import { Colors } from '@renderer/interfaces/Colors'
import React from 'react'

interface TrackStatusProps {
  status: number | null
  onColorChange: (color: string) => void
}

const TrackStatus = React.memo(({ status, onColorChange }: TrackStatusProps) => {
  const [color, setColor] = useState('black')
  const [colors, setColors] = useState<Colors>({})

  useEffect(() => {
    const getColors = async () => {
      const data = (await window.ipcRenderer.invoke('get-store'))?.colors ?? {}
      setColors(data)
      console.log(data, 1)
    }

    getColors()
  }, [])

  const changeColor = (color: string) => {
    const newColor = colors?.general?.[color] ?? colors?.general?.['black'] ?? 'black'
    setColor(newColor)
    onColorChange(newColor)
  }

  useEffect(() => {
    const blinkYellow = async (duration, count) => {
      for (let i = 0; i < count; i++) {
        changeColor('yellow')
        await new Promise((resolve) => setTimeout(resolve, duration))
        changeColor('black')
        await new Promise((resolve) => setTimeout(resolve, duration))
      }
      changeColor('yellow')
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
})

export default TrackStatus
