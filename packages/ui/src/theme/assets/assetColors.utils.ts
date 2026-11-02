import Color from "color"
import { mapValues } from "remeda"

import { ThemeName } from "@/theme"
import assetColors from "@/theme/assets/assetColors.json"

const NEUTRAL_CHROMA = 25

type AssetColorMode = {
  surface: string
  neutral: string
  minContrast: number
}

const ASSET_COLOR_MODES: Record<ThemeName, AssetColorMode> = {
  light: {
    surface: "#ffffff",
    neutral: "#4a4f57",
    minContrast: 1.5,
  },
  dark: {
    surface: "#0d1525",
    neutral: "#e6e8ec",
    minContrast: 3,
  },
}

/**
 * Keeps a logo-derived asset color visible on the theme surface: grays flip
 * to the mode's neutral, other colors keep their hue and move LAB lightness
 * away from the surface until they reach the minimum contrast.
 */
export const adaptAssetColor = (
  hex: string,
  { surface, neutral, minContrast }: AssetColorMode,
) => {
  const background = Color(surface)
  const color = Color(hex)

  if (color.contrast(background) >= minContrast) return hex

  const channels = color.rgb().array()
  if (Math.max(...channels) - Math.min(...channels) <= NEUTRAL_CHROMA)
    return neutral

  // LAB keeps chroma while lightness moves; HSL would turn creams into gold
  const step = background.isDark() ? 1 : -1
  let adapted = color.lab()

  while (adapted.contrast(background) < minContrast) {
    const lightness = adapted.l() + step
    if (lightness < 0 || lightness > 100) break

    adapted = adapted.l(lightness)
  }

  return adapted.hex().toLowerCase()
}

export const getAssetColors = (
  theme: "light" | "dark",
): Record<string, string> =>
  mapValues(assetColors, (hex) =>
    adaptAssetColor(hex, ASSET_COLOR_MODES[theme]),
  )
