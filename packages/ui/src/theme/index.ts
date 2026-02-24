import { makeTheme } from "@theme-ui/css/utils"
import { mapKeys, mapValues, pipe } from "remeda"

import { animations } from "@/styles/animations"
import { easings } from "@/styles/easings"
import { BREAKPOINTS_VALUES } from "@/styles/media"
import { transitions } from "@/styles/transitions"
import { TokenProps, tokens } from "@/theme/tokens"
import { Join, Paths } from "@/types"
import { pxToRem } from "@/utils"

export type ThemeBaseProps = Omit<typeof base, "buttons" | "text">
export type ThemeProps = ThemeBaseProps & TokenProps
export type ThemeName = keyof typeof themes
export type ThemePreference = ThemeName | "system"
export type ThemeColor = Join<Paths<ThemeProps["colors"]>, ".">
export type ThemeToken = Join<Paths<ThemeProps>, ".">
export type ThemeFont = "mono" | keyof ThemeProps["fontFamilies1"]

const headlineSizes = mapValues(tokens.light.headlineSize, pxToRem)
const paragraphSizes = mapValues(tokens.light.paragraphSize, pxToRem)
const lineHeights = mapValues(tokens.light.lineHeight, pxToRem)

const spaceValues = {
  ...tokens.light.scales.paddings,
  ...tokens.light.containers.paddings,
}

const space = {
  ...spaceValues,
  ...pipe(
    spaceValues,
    mapKeys((key) => `-${key}`),
    mapValues((value) => `-${value}`),
  ),
}

const sizes = {
  content: pxToRem(1360),
  "4xs": pxToRem(2),
  "3xs": pxToRem(4),
  "2xs": pxToRem(8),
  xs: pxToRem(12),
  s: pxToRem(14),
  m: pxToRem(16),
  l: pxToRem(20),
  xl: pxToRem(24),
  "2xl": pxToRem(48),
  "3xl": pxToRem(96),
  "4xl": pxToRem(256),
  "5xl": pxToRem(384),
  "6xl": pxToRem(512),
}

const radii = {
  ...tokens.light.scales.cornerRadius,
  full: "9999px",
}

const base = makeTheme({
  breakpoints: BREAKPOINTS_VALUES,
  space,
  sizes,
  fonts: {},
  fontSizes: {
    ...headlineSizes,
    ...paragraphSizes,
  },
  fontWeights: {},
  lineHeights,
  colors: {},
  transitions,
  animations,
  easings,
  radii,
  zIndices: {
    header: 5,
    modal: 10,
    popover: 1000,
    tooltip: 9999,
  },
})

const light = {
  ...base,
  ...tokens.light,
} as unknown as ThemeProps

const dark = {
  ...base,
  ...tokens.dark,
} as unknown as ThemeProps

export const themes = {
  light,
  dark,
}

declare module "@emotion/react" {
  export interface Theme extends ThemeProps {}
}

export { ThemeProvider, useTheme } from "./provider"
export {
  mq,
  type ScreenBreakpoint,
  type ScreenType,
  useBreakpoints,
  useResponsiveValue,
} from "@/styles/media"
