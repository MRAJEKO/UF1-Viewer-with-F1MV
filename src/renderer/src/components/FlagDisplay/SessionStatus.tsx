import { useEffect, useState } from 'react'
import styles from './Panels.module.css'
import { Colors } from '@renderer/interfaces/Colors'
import React from 'react'

interface SessionStatusProps {
  status: string | null
  onColorChange: (color: string | null) => void
}

const SessionStatus = React.memo(({ status, onColorChange }: SessionStatusProps) => {
  const [color, setColor] = useState('transparent')
  const [colors, setColors] = useState<Colors>({})

  useEffect(() => {
    const getColors = async () => {
      const data = (await window.ipcRenderer.invoke('get-store'))?.colors ?? {}
      setColors(data)
    }

    getColors()
  }, [])

  const changeColor = (color: string) => {
    const newColor = colors?.general?.[color] ?? 'transparent'
    setColor(newColor)
    onColorChange(color !== 'transparent' ? color : null)
  }

  const blinkColor = async (color, duration, count) => {
    for (let i = 0; i < count; i++) {
      changeColor(color)
      await new Promise((resolve) => setTimeout(resolve, duration))
      changeColor('default')
      await new Promise((resolve) => setTimeout(resolve, duration))
    }
    changeColor('transparent')
  }

  useEffect(() => {
    switch (status?.toLowerCase()) {
      case 'started':
        blinkColor('green', 500, 3)
        break
      case 'finished':
      case 'finalised':
        blinkColor('white', 1000, 15)
        break
    }
  }, [status])

  return <div className={styles['session-status']} style={{ backgroundColor: color }}></div>
})

export default SessionStatus
