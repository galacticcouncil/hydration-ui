import { makeTheme } from "@theme-ui/css/utils"

import { animations } from "@/styles/animations"
import { easings } from "@/styles/easings"
import { BREAKPOINTS_VALUES } from "@/styles/media"
import { transitions } from "@/styles/transitions"
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
  breakpoints: BREAKPOINTS_VALUES,
  space: [],
  fonts: {},
  fontSizes: [],
  fontWeights: {},
  lineHeights: {},
  colors: {},
  transitions,
  animations,
  easings,
  radii: {
    sm: 2,
    md: 4,
    lg: 8,
    xl: 16,
    xxl: 32,
    full: 9999,
  },
  typography: {
    text: {
      size: {
        p1: { fontSize: lightJSON.paragraphSize.p1 },
        p2: { fontSize: lightJSON.paragraphSize.p2 },
        p3: { fontSize: lightJSON.paragraphSize.p3 },
        p4: { fontSize: lightJSON.paragraphSize.p4 },
        p5: { fontSize: lightJSON.paragraphSize.p5 },
        p6: { fontSize: lightJSON.paragraphSize.p6 },
        h1: { fontSize: lightJSON.headlineSize.h1 },
        h2: { fontSize: lightJSON.headlineSize.h2 },
        h3: { fontSize: lightJSON.headlineSize.h3 },
        h4: { fontSize: lightJSON.headlineSize.h4 },
        h5: { fontSize: lightJSON.headlineSize.h5 },
        h6: { fontSize: lightJSON.headlineSize.h6 },
        h7: { fontSize: lightJSON.headlineSize.h7 },
      },
    },
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
export {
  mq,
  type ScreenBreakpoint,
  type ScreenType,
  useBreakpoints,
} from "@/styles/media"
