import { makeTheme } from "@theme-ui/css/utils"

import { Join, Paths } from "@/types"

import darkJSON from "./tokens/dark.json"
import lightJSON from "./tokens/light.json"

export type ThemeBaseProps = Omit<typeof base, "buttons" | "text">
export type ThemeProps = ThemeBaseProps & typeof lightJSON
export type ThemeName = keyof typeof themes
export type ThemeColor = Join<Paths<ThemeProps["colors"]>, ".">
export type ThemeToken = Join<Paths<ThemeProps>, ".">
export type ThemeFont = keyof ThemeProps["fontFamilies1"]

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

const light = {
  ...base,
  ...lightJSON,
} as unknown as ThemeProps

const dark = {
  ...base,
  ...darkJSON,
} as unknown as ThemeProps

export const themes = {
  light,
  dark,
}

declare module "@emotion/react" {
  export interface Theme extends ThemeProps {}
}

export { ThemeProvider, useTheme } from "./provider"
