export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export const openUrl = (url: string, target = "_blank") => {
  window.open(url, target)
}

export const isHexColor = (hex: string): boolean => {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
}

export const hexToRgba = (hex: string, alpha = 1): string => {
  if (!isHexColor(hex)) return ""
  const hexValue = hex.replace("#", "")
  const r = parseInt(hexValue.substring(0, 2), 16)
  const g = parseInt(hexValue.substring(2, 4), 16)
  const b = parseInt(hexValue.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
