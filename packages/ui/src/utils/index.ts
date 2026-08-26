import { css, SerializedStyles, Theme as EmotionTheme } from "@emotion/react"
import { hasOwn } from "@galacticcouncil/utils"
import { SxProp } from "@theme-ui/core"
import { get, Theme as ThemeUI, ThemeUICSSObject } from "@theme-ui/css"
import { isNumber, isString } from "remeda"

import { ThemeProps, ThemeToken } from "@/theme"
import { tokens } from "@/theme/tokens"

export const ROOT_FONT_SIZE = 16
export const UI_SCALE_VAR = "--ui-scale"

export const pxToRem = (n: number | string): string => {
  if (isString(n) && n.endsWith("rem")) return n

  const px = isNumber(n) ? n : parseFloat(n)

  if (!isFinite(px)) return "0rem"

  return `${px / ROOT_FONT_SIZE}rem`
}

declare const __brand: unique symbol
export type Branded<T> = true & { [__brand]: T }

export function getToken(
  token: ThemeToken,
): (theme: ThemeUI) => ThemeUICSSObject
export function getToken(
  token: ThemeToken[],
): (theme: ThemeUI) => ThemeUICSSObject[]
export function getToken(token: ThemeToken | ThemeToken[]) {
  return (theme: ThemeUI) =>
    Array.isArray(token) ? token.map((t) => get(theme, t)) : get(theme, token)
}

/**
 * Brand color of an asset, falling back to a neutral when the asset has no
 * generated color. Composite assets (aTokens, pool shares) resolve through
 * `useAssetColor` in the app, which knows their underlying assets.
 */
export const getAssetColor =
  (id: string | number) =>
  (theme: ThemeUI): string =>
    get(theme, `assets.${id}`, get(theme, "text.medium"))

/**
 * Even sRGB blend of any number of `#rrggbb` colors — the shape the generated
 * asset palette is written in.
 */
export const mixColors = (colors: string[]): string | undefined => {
  if (!colors.length) return undefined

  const channel = (offset: number) =>
    Math.round(
      colors.reduce(
        (sum, hex) => sum + parseInt(hex.slice(offset, offset + 2), 16),
        0,
      ) / colors.length,
    )
      .toString(16)
      .padStart(2, "0")

  return `#${channel(1)}${channel(3)}${channel(5)}`
}

export function createStyles<T extends SerializedStyles>(
  callback: (theme: EmotionTheme) => T,
) {
  return () =>
    ({ theme }: { theme: EmotionTheme }) =>
      callback(theme)
}

type ExtractString<T> = T extends string ? T : never

export function createVariants<TKey = string>(
  callback: (
    theme: EmotionTheme,
  ) => Record<ExtractString<TKey>, SerializedStyles>,
) {
  return (key: ExtractString<TKey>) =>
    ({ theme }: { theme: EmotionTheme }) =>
      callback(theme)[key]
}

type SpacingProp = keyof ThemeProps["scales"]["paddings"]

const isSpacingValue = (
  value: number | string | SpacingProp,
): value is SpacingProp => {
  return (
    typeof value === "string" && hasOwn(tokens.light.scales.paddings, value)
  )
}

export const getSpacingValue = (value: number | string | SpacingProp) => {
  if (!isSpacingValue(value)) return value
  return tokens.light.scales.paddings[value]
}

export { css, type SxProp }
export { default as styled } from "@emotion/styled"

// Container Query utilities
export * from "../styles/container"
