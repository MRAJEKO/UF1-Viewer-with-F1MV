import { Colors } from '@renderer/interfaces/Colors'
import { useEffect, useState } from 'react'
import styles from './Panels.module.css'
import React from 'react'

interface FastestLapProps {
  fastestLap: string | null
}

const FastestLap = React.memo(({ fastestLap }: FastestLapProps) => {
  const [color, setColor] = useState('transparent')
  const [colors, setColors] = useState<Colors>({})

  useEffect(() => {
    const getColors = async () => {
      const data = (await window.ipcRenderer.invoke('get-store'))?.colors ?? {}
      setColors(data)
    }

    getColors()
  }, [])

  useEffect(() => {
    console.log(fastestLap)

    const changeColor = (color: string) => {
      if (colors?.general?.[color]) setColor(colors.general[color])
      else setColor('transparent')
    }

    changeColor('purple')
    setTimeout(() => {
      changeColor('transparent')
    }, 2000)
  }, [fastestLap])

  return <div className={styles.panel} style={{ zIndex: 2, backgroundColor: color }}></div>
})

export default FastestLap
