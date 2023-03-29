import React from 'react'

interface SettingProps {
  id: string
  title: string
  description: string
  type: string
  value: string | number | boolean
  options?: {
    value: string | number | boolean
    title: string
  }[]
}

const Setting = ({ id, title, description, type, value, options }: SettingProps) => {
  return <p>{title}</p>
}

export default Setting
