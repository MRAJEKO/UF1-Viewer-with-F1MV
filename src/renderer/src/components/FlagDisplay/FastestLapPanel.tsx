import { useEffect, useState } from 'react'
import styles from './Panels.module.scss'
import React from 'react'
import colors from '@renderer/modules/Colors'

interface FastestLapProps {
  fastestLap: string | null
  onColorChange: (color: string | null) => void
}

const FastestLap = React.memo(({ fastestLap, onColorChange }: FastestLapProps) => {
  const [color, setColor] = useState('transparent')

  const changeColor = (color: string) => {
    const newColor = colors?.[color] ?? 'transparent'
    setColor(newColor)
    onColorChange(color !== 'transparent' ? color : null)
  }

  useEffect(() => {
    changeColor('purple')
    setTimeout(() => {
      changeColor('transparent')
    }, 2000)
  }, [fastestLap])

  return <div className={styles.panel} style={{ zIndex: 2, backgroundColor: color }}></div>
})

export default FastestLap
