import compositionAssetColors from "@/modules/stats/treasury/compositionAssetColors.json"

const colorCache = new Map<string, string>()
const pendingCache = new Map<string, Promise<string>>()

export const FALLBACK_COLOR = "#5a6270"

const compositionAssetColorMap = compositionAssetColors.assets as Record<
  string,
  string | undefined
>

export const getPrecomputedCompositionColor = (assetId: string) =>
  compositionAssetColorMap[assetId]

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`

const normalizeHex = (hex: string) => {
  const value = hex.trim()

  if (!value.startsWith("#")) return null

  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase()
  }

  if (value.length === 7) {
    return value.toLowerCase()
  }

  return null
}

const hexToRgb = (hex: string) => {
  const normalized = normalizeHex(hex)

  if (!normalized) return null

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  }
}

const getSaturation = (r: number, g: number, b: number) => {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  if (max === 0) return 0

  return (max - min) / max
}

const isBackgroundColor = (hex: string) => {
  const rgb = hexToRgb(hex)

  if (!rgb) return true

  const { r, g, b } = rgb
  const brightness = (r + g + b) / 3

  return brightness > 245 || brightness < 12 || getSaturation(r, g, b) < 0.08
}

const enhanceColorForTile = (hex: string) => {
  const rgb = hexToRgb(hex)

  if (!rgb) return FALLBACK_COLOR

  const { r, g, b } = rgb
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  if (delta === 0) return hex

  const saturationBoost = 1.18
  const midpoint = (max + min) / 2

  const boostChannel = (channel: number) => {
    const offset = channel - midpoint
    return Math.max(
      0,
      Math.min(255, Math.round(midpoint + offset * saturationBoost)),
    )
  }

  return rgbToHex(boostChannel(r), boostChannel(g), boostChannel(b))
}

export { enhanceColorForTile }

const isAccentBadgeColor = (r: number, g: number, b: number) =>
  b > 150 && b > r * 1.35 && b > g * 1.1 && getSaturation(r, g, b) > 0.45

const isWarmBrandColor = (r: number, g: number, b: number) =>
  r > 120 && g > 90 && b < r * 0.9

const scoreTileColor = (hex: string, weight = 1) => {
  const rgb = hexToRgb(hex)

  if (!rgb) return -1

  const { r, g, b } = rgb
  const saturation = getSaturation(r, g, b)
  let score = saturation * 80 * weight

  if (isAccentBadgeColor(r, g, b)) score *= 0.2
  if (isWarmBrandColor(r, g, b)) score *= 1.4

  return score
}

const pickBestTileColor = (
  colors: readonly string[],
  weights = new Map<string, number>(),
) => {
  let bestColor = ""
  let bestScore = -1

  for (const color of colors) {
    const normalized = normalizeHex(color)

    if (!normalized || isBackgroundColor(normalized)) continue

    const score = scoreTileColor(normalized, weights.get(normalized) ?? 1)

    if (score > bestScore) {
      bestScore = score
      bestColor = normalized
    }
  }

  return bestColor
}

const parseSvgColorWeights = (svg: string) => {
  const weights = new Map<string, number>()
  const matches = [
    ...svg.matchAll(
      /(?:fill|stop-color|color)\s*=\s*["']?(#[0-9A-Fa-f]{3,8})/gi,
    ),
  ]

  for (const match of matches) {
    const normalized = normalizeHex(match[1] ?? "")

    if (!normalized) continue

    weights.set(normalized, (weights.get(normalized) ?? 0) + 1)
  }

  return weights
}

const parseSvgColors = (svg: string) =>
  Array.from(parseSvgColorWeights(svg).keys())

const extractSvgColor = async (iconSrc: string) => {
  if (!iconSrc.endsWith(".svg")) return null

  const response = await fetch(iconSrc)

  if (!response.ok) return null

  const svg = await response.text()
  const colorWeights = parseSvgColorWeights(svg)
  const color = pickBestTileColor(parseSvgColors(svg), colorWeights)

  return color ? enhanceColorForTile(color) : null
}

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error(`Failed to load logo: ${src}`))
    image.src = src
  })

const isBackgroundPixel = (r: number, g: number, b: number, a: number) => {
  if (a < 128) return true

  const brightness = (r + g + b) / 3

  return brightness > 245 || brightness < 12
}

const extractCanvasColor = async (src: string) => {
  const image = await loadImage(src)
  const canvas = document.createElement("canvas")
  const size = 48

  canvas.width = size
  canvas.height = size

  const context = canvas.getContext("2d", { willReadFrequently: true })

  if (!context) return null

  context.drawImage(image, 0, 0, size, size)

  const { data } = context.getImageData(0, 0, size, size)
  const buckets = new Map<
    string,
    { r: number; g: number; b: number; weight: number }
  >()

  for (let index = 0; index < data.length; index += 4) {
    const r = data[index] ?? 0
    const g = data[index + 1] ?? 0
    const b = data[index + 2] ?? 0
    const a = data[index + 3] ?? 0

    if (isBackgroundPixel(r, g, b, a)) continue

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max === 0 ? 0 : (max - min) / max
    const qr = Math.round(r / 16) * 16
    const qg = Math.round(g / 16) * 16
    const qb = Math.round(b / 16) * 16
    const key = `${qr},${qg},${qb}`
    const weight = 1 + saturation * 1.5
    const bucket = buckets.get(key)

    if (bucket) {
      bucket.r += r * weight
      bucket.g += g * weight
      bucket.b += b * weight
      bucket.weight += weight
      continue
    }

    buckets.set(key, {
      r: r * weight,
      g: g * weight,
      b: b * weight,
      weight,
    })
  }

  if (!buckets.size) return null

  let dominant = { r: 0, g: 0, b: 0, weight: 0 }

  for (const bucket of buckets.values()) {
    if (bucket.weight > dominant.weight) {
      dominant = bucket
    }
  }

  return enhanceColorForTile(
    rgbToHex(
      Math.round(dominant.r / dominant.weight),
      Math.round(dominant.g / dominant.weight),
      Math.round(dominant.b / dominant.weight),
    ),
  )
}

const pickPreferredExtractedColor = (
  svgColor: string | null,
  canvasColor: string | null,
) => {
  if (!svgColor) return canvasColor
  if (!canvasColor) return svgColor

  const svgScore = scoreTileColor(svgColor)
  const canvasScore = scoreTileColor(canvasColor)

  return canvasScore >= svgScore * 0.85 ? canvasColor : svgColor
}

const extractColor = async (iconSrc: string) => {
  const [svgColor, canvasColor] = await Promise.all([
    extractSvgColor(iconSrc).catch(() => null),
    extractCanvasColor(iconSrc).catch(() => null),
  ])

  return (
    pickPreferredExtractedColor(svgColor, canvasColor) ??
    svgColor ??
    canvasColor ??
    FALLBACK_COLOR
  )
}

export const getLogoDominantColor = async (iconSrc: string) => {
  const cached = colorCache.get(iconSrc)

  if (cached) return cached

  let pending = pendingCache.get(iconSrc)

  if (!pending) {
    pending = extractColor(iconSrc)
      .catch(() => FALLBACK_COLOR)
      .then((color) => {
        colorCache.set(iconSrc, color)
        pendingCache.delete(iconSrc)
        return color
      })

    pendingCache.set(iconSrc, pending)
  }

  return pending
}

export const mixCompositionColors = (
  colorA: string,
  colorB: string,
  weightA = 0.52,
) => {
  const rgbA = hexToRgb(colorA)
  const rgbB = hexToRgb(colorB)

  if (!rgbA) return colorB
  if (!rgbB) return colorA

  const weightB = 1 - weightA

  return rgbToHex(
    Math.round(rgbA.r * weightA + rgbB.r * weightB),
    Math.round(rgbA.g * weightA + rgbB.g * weightB),
    Math.round(rgbA.b * weightA + rgbB.b * weightB),
  )
}
