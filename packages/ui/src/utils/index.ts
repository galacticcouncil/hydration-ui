import { SerializedStyles, Theme as EmotionTheme } from "@emotion/react"
import { get, Theme as ThemeUI, ThemeUICSSObject } from "@theme-ui/css"

import { ThemeToken } from "@/theme"

export const px = (n: number | string) => (typeof n === "number" ? n + "px" : n)

export const getToken =
  (token: ThemeToken | ThemeToken[]) =>
  (theme: ThemeUI): ThemeUICSSObject =>
    Array.isArray(token) ? token.map((t) => get(theme, t)) : get(theme, token)

export function createVariants<T extends Record<string, SerializedStyles>>(
  callback: (theme: EmotionTheme) => T,
) {
  return (key: keyof T) =>
    ({ theme }: { theme: EmotionTheme }) =>
      callback(theme)[key]
}
