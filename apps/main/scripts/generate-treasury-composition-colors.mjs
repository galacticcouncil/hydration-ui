#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { PNG } from "pngjs"

const HYDRATION_PARACHAIN_ID = "2034"
const FALLBACK_COLOR = "#5a6270"
const METADATA_BASE_URL =
  "https://raw.githubusercontent.com/galacticcouncil/intergalactic-asset-metadata/master"
const DEFAULT_ASSET_IDS = [
  "0",
  "1",
  "5",
  "10",
  "15",
  "22",
  "34",
  "40",
  "43",
  "46",
  "69",
  "103",
  "104",
  "110",
  "111",
  "112",
  "113",
  "143",
  "222",
  "690",
  "1005",
  "1043",
  "4200",
  "10044",
  "90001",
  "1000625",
  "1000745",
  "1000809",
  "1001351",
]
const ASSET_ICON_ID_FALLBACKS = {
  "103": ["222", "10"],
  "104": ["222", "34"],
  "110": ["222", "22"],
  "111": ["222", "10"],
  "112": ["222", "1000745"],
  "113": ["222", "1000625"],
  "143": ["222", "43"],
  "1005": ["5"],
  "1043": ["43"],
  "10044": ["222"],
  "1001351": ["222"],
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const palettePath = resolve(
  scriptDir,
  "../src/modules/stats/treasury/compositionAssetColors.json",
)

const args = process.argv.slice(2)
const getArgValues = (name) =>
  args
    .filter((arg) => arg.startsWith(`${name}=`))
    .map((arg) => arg.slice(name.length + 1))
    .filter(Boolean)

const requestedAssetIds = getArgValues("--asset-id")
const assetIds = requestedAssetIds.length ? requestedAssetIds : DEFAULT_ASSET_IDS

const rgbToHex = (r, g, b) =>
  `#${[r, g, b]
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`

const normalizeHex = (hex) => {
  const value = hex.trim()

  if (!value.startsWith("#")) return null

  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase()
  }

  if (value.length === 7) return value.toLowerCase()

  return null
}

const hexToRgb = (hex) => {
  const normalized = normalizeHex(hex)

  if (!normalized) return null

  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16),
  }
}

const getSaturation = (r, g, b) => {
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  return max === 0 ? 0 : (max - min) / max
}

const isBackgroundColor = (hex) => {
  const rgb = hexToRgb(hex)

  if (!rgb) return true

  const { r, g, b } = rgb
  const brightness = (r + g + b) / 3

  return brightness > 245 || brightness < 12 || getSaturation(r, g, b) < 0.08
}

const isAccentBadgeColor = (r, g, b) =>
  b > 150 && b > r * 1.35 && b > g * 1.1 && getSaturation(r, g, b) > 0.45

const isWarmBrandColor = (r, g, b) => r > 120 && g > 90 && b < r * 0.9

const scoreTileColor = (hex, weight = 1) => {
  const rgb = hexToRgb(hex)

  if (!rgb) return -1

  const { r, g, b } = rgb
  const saturation = getSaturation(r, g, b)
  let score = saturation * 80 * weight

  if (isAccentBadgeColor(r, g, b)) score *= 0.2
  if (isWarmBrandColor(r, g, b)) score *= 1.4

  return score
}

const enhanceColorForTile = (hex) => {
  const rgb = hexToRgb(hex)

  if (!rgb) return FALLBACK_COLOR

  const { r, g, b } = rgb
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  if (delta === 0) return hex

  const saturationBoost = 1.18
  const midpoint = (max + min) / 2
  const boostChannel = (channel) => {
    const offset = channel - midpoint

    return Math.max(
      0,
      Math.min(255, Math.round(midpoint + offset * saturationBoost)),
    )
  }

  return rgbToHex(boostChannel(r), boostChannel(g), boostChannel(b))
}

const mixHex = (colorA, colorB, weightA) => {
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

const parseSvgColorWeights = (svg) => {
  const weights = new Map()
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

const pickBestTileColor = (colors, weights = new Map()) => {
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

const getJson = async (url) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}: ${response.status}`)
  }

  return response.json()
}

const getText = async (url) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}: ${response.status}`)
  }

  return response.text()
}

const getBuffer = async (url) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}: ${response.status}`)
  }

  return Buffer.from(await response.arrayBuffer())
}

const getBaseUrl = (data) => {
  const { cdn, path, repository } = data

  return [cdn.jsDelivr, `${repository}@latest`, path].join("/")
}

const getAssetLogoSrc = (assetPaths, assetId) => {
  const key = ["polkadot", HYDRATION_PARACHAIN_ID, "assets", assetId].join("/")

  return assetPaths.find((path) => path.includes(`${key}/icon`)) ?? ""
}

const getSvgColor = async (iconSrc) => {
  if (!iconSrc.endsWith(".svg")) return FALLBACK_COLOR

  const svg = await getText(iconSrc)
  const colorWeights = parseSvgColorWeights(svg)
  const color = pickBestTileColor(Array.from(colorWeights.keys()), colorWeights)

  return color ? enhanceColorForTile(color) : FALLBACK_COLOR
}

const isBackgroundPixel = (r, g, b, a) => {
  if (a < 128) return true

  const brightness = (r + g + b) / 3

  return brightness > 245 || brightness < 12
}

const getPngColor = async (iconSrc) => {
  if (!iconSrc.endsWith(".png")) return FALLBACK_COLOR

  const png = PNG.sync.read(await getBuffer(iconSrc))
  const buckets = new Map()

  for (let index = 0; index < png.data.length; index += 4) {
    const r = png.data[index] ?? 0
    const g = png.data[index + 1] ?? 0
    const b = png.data[index + 2] ?? 0
    const a = png.data[index + 3] ?? 0

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

  if (!buckets.size) return FALLBACK_COLOR

  let dominant = { r: 0, g: 0, b: 0, weight: 0 }

  for (const bucket of buckets.values()) {
    if (bucket.weight > dominant.weight) dominant = bucket
  }

  return enhanceColorForTile(
    rgbToHex(
      Math.round(dominant.r / dominant.weight),
      Math.round(dominant.g / dominant.weight),
      Math.round(dominant.b / dominant.weight),
    ),
  )
}

const getIconColor = (iconSrc) =>
  iconSrc.endsWith(".png") ? getPngColor(iconSrc) : getSvgColor(iconSrc)



const main = async () => {
  const palette = JSON.parse(await readFile(palettePath, "utf8"))
  const assetResource = await getJson(`${METADATA_BASE_URL}/assets-v2.json`)
  const assetBaseUrl = getBaseUrl(assetResource)
  const assetPaths = assetResource.items.map((item) => `${assetBaseUrl}/${item}`)
  const nextAssets = { ...(palette.assets ?? {}) }

  for (const assetId of assetIds) {
    const fallbackIconIds = ASSET_ICON_ID_FALLBACKS[assetId] ?? []
    const iconSrcs = [assetId, ...fallbackIconIds]
      .map((iconId) => getAssetLogoSrc(assetPaths, iconId))
      .filter(Boolean)

    if (!iconSrcs.length) {
      console.warn(`Skipping ${assetId}: icon not found`)
      continue
    }

    const iconColors = await Promise.all(
      iconSrcs.map((iconSrc) =>
        getIconColor(iconSrc).catch((error) => {
          console.warn(`Using fallback for ${assetId}: ${error.message}`)

          return FALLBACK_COLOR
        }),
      ),
    )
    const [firstColor, ...restColors] = iconColors
    const base = firstColor
      ? enhanceColorForTile(
          restColors.reduce(
            (mixedColor, color, index) =>
              mixHex(mixedColor, color, (index + 1) / (index + 2)),
            firstColor,
          ),
        )
      : FALLBACK_COLOR

    const safeBase = base || FALLBACK_COLOR

    nextAssets[assetId] = safeBase
  }

  const nextPalette = {
    version: 1,
    generatedAt: new Date().toISOString(),
    assets: Object.fromEntries(
      Object.entries(nextAssets).sort(([assetA], [assetB]) =>
        assetA.localeCompare(assetB, undefined, { numeric: true }),
      ),
    ),
  }

  await writeFile(palettePath, `${JSON.stringify(nextPalette, null, 2)}\n`)
  console.log(`Wrote ${Object.keys(nextPalette.assets).length} colors`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
