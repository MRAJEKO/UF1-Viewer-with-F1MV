export const contrastColor = (backgroundColor: string) => {
  const rgb = hexToRgb(backgroundColor)

  const brightness = calculateBrightness(rgb)

  if (isNaN(brightness)) return undefined

  return brightness > 128 ? '#000000' : '#FFFFFF'
}

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.substring(1, 3), 16)
  const g = parseInt(hex.substring(3, 5), 16)
  const b = parseInt(hex.substring(5, 7), 16)

  return { r, g, b }
}

const calculateBrightness = (rgb: { r: number; g: number; b: number }) => {
  return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
}
