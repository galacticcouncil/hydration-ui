#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import sharp from "sharp"

const HYDRATION_PARACHAIN_ID = "2034"
const METADATA_BASE_URL =
  "https://raw.githubusercontent.com/galacticcouncil/intergalactic-asset-metadata/master"
const CONCURRENCY = 8

// 4 and 20 are both WETH: a black-and-white logo whose only saturated pixels are
// a magenta ring, so the generator picks pink. Overrides always win over a rerun.
const OVERRIDES = {
  4: "#627eea",
  20: "#627eea",
}

const scriptDir = dirname(fileURLToPath(import.meta.url))
const outputPath = resolve(scriptDir, "../src/theme/assetColors.json")

const args = process.argv.slice(2)
const requestedAssetIds = args
  .filter((arg) => arg.startsWith("--asset-id="))
  .map((arg) => arg.slice("--asset-id=".length))
  .filter(Boolean)

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
  let score = getSaturation(r, g, b) * 80 * weight

  if (isAccentBadgeColor(r, g, b)) score *= 0.2
  if (isWarmBrandColor(r, g, b)) score *= 1.4

  return score
}

const enhanceColorForTile = (hex) => {
  const rgb = hexToRgb(hex)

  if (!rgb) return null

  const { r, g, b } = rgb
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)

  if (max - min === 0) return hex

  const saturationBoost = 1.18
  const midpoint = (max + min) / 2
  const boostChannel = (channel) =>
    Math.max(
      0,
      Math.min(255, Math.round(midpoint + (channel - midpoint) * saturationBoost)),
    )

  return rgbToHex(boostChannel(r), boostChannel(g), boostChannel(b))
}

const parseSvgColorWeights = (svg) => {
  const weights = new Map()
  const matches = svg.matchAll(
    /(?:fill|stop-color|color)\s*=\s*["']?(#[0-9A-Fa-f]{3,8})/gi,
  )

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

const fetchOk = async (url) => {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}: ${response.status}`)
  }

  return response
}

const getSvgColor = async (iconSrc) => {
  const svg = await (await fetchOk(iconSrc)).text()
  const colorWeights = parseSvgColorWeights(svg)

  return pickBestTileColor(Array.from(colorWeights.keys()), colorWeights)
}

const isBackgroundPixel = (r, g, b, a) => {
  if (a < 128) return true

  const brightness = (r + g + b) / 3

  return brightness > 245 || brightness < 12
}

const getRasterColor = async (iconSrc) => {
  const buffer = Buffer.from(await (await fetchOk(iconSrc)).arrayBuffer())
  const { data } = await sharp(buffer)
    .raw()
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true })
  const buckets = new Map()

  for (let index = 0; index < data.length; index += 4) {
    const r = data[index] ?? 0
    const g = data[index + 1] ?? 0
    const b = data[index + 2] ?? 0
    const a = data[index + 3] ?? 0

    if (isBackgroundPixel(r, g, b, a)) continue

    // quantize into 16-step buckets so near-identical shades vote together
    const key = `${Math.round(r / 16)},${Math.round(g / 16)},${Math.round(b / 16)}`
    const weight = 1 + getSaturation(r, g, b) * 1.5
    const bucket = buckets.get(key)

    if (bucket) {
      bucket.r += r * weight
      bucket.g += g * weight
      bucket.b += b * weight
      bucket.weight += weight
      continue
    }

    buckets.set(key, { r: r * weight, g: g * weight, b: b * weight, weight })
  }

  let dominant = { r: 0, g: 0, b: 0, weight: 0 }

  for (const bucket of buckets.values()) {
    if (bucket.weight > dominant.weight) dominant = bucket
  }

  if (!dominant.weight) return ""

  return rgbToHex(
    Math.round(dominant.r / dominant.weight),
    Math.round(dominant.g / dominant.weight),
    Math.round(dominant.b / dominant.weight),
  )
}

const getIconColor = (iconSrc) =>
  iconSrc.endsWith(".svg") ? getSvgColor(iconSrc) : getRasterColor(iconSrc)

const mapWithConcurrency = async (items, limit, worker) => {
  const results = []
  let cursor = 0

  const run = async () => {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await worker(items[index])
    }
  }

  await Promise.all(Array.from({ length: limit }, run))

  return results
}

const main = async () => {
  const existing = JSON.parse(
    await readFile(outputPath, "utf8").catch(() => "{}"),
  )
  const metadata = await (
    await fetchOk(`${METADATA_BASE_URL}/assets-v2.json`)
  ).json()
  const { cdn, path, repository } = metadata
  const baseUrl = [cdn.jsDelivr, `${repository}@latest`, path].join("/")
  const iconPattern = new RegExp(
    `polkadot/${HYDRATION_PARACHAIN_ID}/assets/(\\d+)/icon`,
  )

  const icons = metadata.items.flatMap((item) => {
    const id = item.match(iconPattern)?.[1]

    if (!id) return []
    if (requestedAssetIds.length && !requestedAssetIds.includes(id)) return []

    return [{ id, src: `${baseUrl}/${item}` }]
  })

  const colors = await mapWithConcurrency(icons, CONCURRENCY, async (icon) => {
    try {
      const color = enhanceColorForTile(await getIconColor(icon.src))

      if (!color) console.warn(`Skipping ${icon.id}: no usable color`)

      return color
    } catch (error) {
      console.warn(`Skipping ${icon.id}: ${error.message}`)

      return null
    }
  })

  // entries are kept on failure so a hand-corrected color survives a rerun
  const next = { ...existing }

  icons.forEach((icon, index) => {
    const color = colors[index]

    if (color) next[icon.id] = color
  })

  Object.assign(next, OVERRIDES)

  const sorted = Object.fromEntries(
    Object.entries(next).sort(([a], [b]) =>
      a.localeCompare(b, undefined, { numeric: true }),
    ),
  )

  await writeFile(outputPath, `${JSON.stringify(sorted, null, 2)}\n`)
  console.log(`Wrote ${Object.keys(sorted).length} colors to ${outputPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
