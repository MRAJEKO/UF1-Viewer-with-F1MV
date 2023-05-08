import { useEffect, useState } from 'react'
import styles from './Panels.module.css'
import colors from '@renderer/modules/Colors'
import React from 'react'

interface TrackStatusProps {
  status: number | null
  onColorChange: (color: string | null) => void
}

const TrackStatus = React.memo(({ status, onColorChange }: TrackStatusProps) => {
  const [color, setColor] = useState('black')

  const changeColor = (color: string) => {
    const newColor = colors?.[color] ?? 'transparent'
    setColor(newColor)
    onColorChange(color !== 'transparent' ? color : null)
  }

  useEffect(() => {
    const blinkYellow = async (duration, count) => {
      for (let i = 0; i < count; i++) {
        changeColor('yellow')
        await new Promise((resolve) => setTimeout(resolve, duration))
        changeColor('default')
        await new Promise((resolve) => setTimeout(resolve, duration))
      }
      changeColor('yellow')
    }

    switch (status) {
      case 1:
        changeColor('green')
        setTimeout(() => {
          changeColor('transparent')
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
