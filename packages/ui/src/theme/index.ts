export type ThemeProps = typeof light
export type ThemeName = keyof typeof themes
export type ThemeColor = Join<Paths<ThemeProps["colors"]>, ".">
export type ThemeToken = Join<Paths<ThemeProps>, ".">
export type ThemeFont = keyof ThemeProps["fontFamilies1"]

import { makeTheme } from "@theme-ui/css/utils"

import { Join, Paths } from "@/types"

import darkJSON from "./tokens/Core tokens-Dark-Desktop.json"
import lightJSON from "./tokens/Core tokens-Light-Desktop.json"

const base = makeTheme({
  space: [],
  fonts: {},
  fontSizes: [],
  fontWeights: {},
  lineHeights: {},
  colors: {},
  radii: {
    sm: 2,
    md: 4,
    lg: 8,
    xl: 16,
    full: 9999,
  },
})

const light = makeTheme({
  ...base,
  ...lightJSON,
  colors: lightJSON.Colors,
})

const dark = makeTheme({
  ...base,
  ...darkJSON,
  colors: darkJSON.Colors,
}) as unknown as ThemeProps

export const themes = {
  light,
  dark,
}

declare module "@emotion/react" {
  export interface Theme extends ThemeProps {}
}

export { ThemeProvider, useTheme } from "./provider"
