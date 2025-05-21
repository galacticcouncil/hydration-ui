import { css, SerializedStyles, Theme as EmotionTheme } from "@emotion/react"
import { SxProp } from "@theme-ui/core"
import { get, Theme as ThemeUI, ThemeUICSSObject } from "@theme-ui/css"

import { ThemeToken } from "@/theme"

export const px = (n: number | string) => (typeof n === "number" ? n + "px" : n)

declare const __brand: unique symbol
export type Branded<T> = true & { [__brand]: T }

export type MinusPx = Branded<"MinusPx">

export const minusPx = true as MinusPx

export const getToken =
  (token: ThemeToken | ThemeToken[]) =>
  (theme: ThemeUI): ThemeUICSSObject =>
    Array.isArray(token) ? token.map((t) => get(theme, t)) : get(theme, token)

export const getTokenPx =
  (token: ThemeToken | ThemeToken[], minus?: MinusPx) => (theme: ThemeUI) =>
    Array.isArray(token)
      ? token.map((t) => `${minus ? "-" : ""}${get(theme, t)}px`)
      : `${minus ? "-" : ""}${get(theme, token)}px`

export const getMinusTokenPx = (token: ThemeToken | ThemeToken[]) =>
  getTokenPx(token, minusPx)

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

export { css, type SxProp }
export { default as styled } from "@emotion/styled"
