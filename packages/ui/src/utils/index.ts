import { css, SerializedStyles, Theme as EmotionTheme } from "@emotion/react"
import { SxProp } from "@theme-ui/core"
import { get, Theme as ThemeUI, ThemeUICSSObject } from "@theme-ui/css"

import { ThemeToken } from "@/theme"

export const px = (n: number | string) => (typeof n === "number" ? n + "px" : n)

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

export function createVariants<TKey extends string>(
  callback: (theme: EmotionTheme) => Record<TKey, SerializedStyles>,
) {
  return (key: TKey) =>
    ({ theme }: { theme: EmotionTheme }) =>
      callback(theme)[key]
}

export { css, type SxProp }
export { default as styled } from "@emotion/styled"
