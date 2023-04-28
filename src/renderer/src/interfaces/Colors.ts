export interface Color {
  name: string
}

export interface Colors {
  [key: string]: Color
}

export interface LedColors {
  [key: string]: [number, number, number]
}
