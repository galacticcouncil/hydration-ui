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

export const getToken =
  (token: ThemeToken | ThemeToken[]) =>
  (theme: ThemeUI): ThemeUICSSObject =>
    Array.isArray(token) ? token.map((t) => get(theme, t)) : get(theme, token)

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
