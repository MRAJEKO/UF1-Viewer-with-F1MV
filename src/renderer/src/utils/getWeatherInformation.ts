export const getWindDirection = (direction: number) => {
  if (direction >= 337.5 || direction < 22.5) {
    return 'N'
  } else if (direction >= 22.5 && direction < 67.5) {
    return 'NE'
  } else if (direction >= 67.5 && direction < 112.5) {
    return 'E'
  } else if (direction >= 112.5 && direction < 157.5) {
    return 'SE'
  } else if (direction >= 157.5 && direction < 202.5) {
    return 'S'
  } else if (direction >= 202.5 && direction < 247.5) {
    return 'SW'
  } else if (direction >= 247.5 && direction < 292.5) {
    return 'W'
  } else if (direction >= 292.5 && direction < 337.5) {
    return 'NW'
  }

  return '?'
}
