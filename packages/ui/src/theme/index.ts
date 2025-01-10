import { makeTheme } from "@theme-ui/css/utils"
import { useCallback, useMemo } from "react"
import { useMedia } from "react-use"

import { Join, Paths } from "@/types"

import darkJSON from "./tokens/dark.json"
import lightJSON from "./tokens/light.json"

export type ThemeBaseProps = Omit<typeof base, "buttons" | "text">
export type ThemeProps = ThemeBaseProps & typeof lightJSON
export type ThemeName = keyof typeof themes
export type ThemeColor = Join<Paths<ThemeProps["colors"]>, ".">
export type ThemeToken = Join<Paths<ThemeProps>, ".">
export type ThemeFont = keyof ThemeProps["fontFamilies1"]

export type ScreenBreakpoint = "xs" | "sm" | "md" | "lg" | "xl"
export type ScreenType = "mobile" | "tablet" | "desktop"

const base = makeTheme({
  breakpoints: ["480px", "768px", "1024px", "1280px"],
  space: [],
  fonts: {},
  fontSizes: [],
  fontWeights: {},
  lineHeights: {},
  colors: {},
  transitions: {
    all: "all 0.15s",
    colors: "color 0.15s, background-color 0.15s, border-color 0.15s",
    transform: "transform 0.15s",
    opacity: "opacity 0.15s",
  },
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

export const useBreakpoints = () => {
  const xs = useMedia(`(min-width: 0px)`)
  const sm = useMedia(`(min-width: ${base.breakpoints[0]})`)
  const md = useMedia(`(min-width: ${base.breakpoints[1]})`)
  const lg = useMedia(`(min-width: ${base.breakpoints[2]})`)
  const xl = useMedia(`(min-width: ${base.breakpoints[3]})`)

  const match = useMemo(() => {
    const bps = [
      { bp: "xl", match: xl },
      { bp: "lg", match: lg },
      { bp: "md", match: md },
      { bp: "sm", match: sm },
      { bp: "xs", match: xs },
    ].filter((bp) => bp.match === true)
    return {
      matches: bps.map((item) => item.bp),
      current: (bps[0] ? bps[0].bp : "xs") as ScreenBreakpoint,
    }
  }, [lg, md, sm, xl, xs])

  const gte = useCallback(
    (givenBp: ScreenBreakpoint) => {
      return match.matches.includes(givenBp)
    },
    [match],
  )

  const screen = useMemo<ScreenType | null>(() => {
    return gte("lg")
      ? "desktop"
      : gte("sm")
        ? "tablet"
        : gte("xs")
          ? "mobile"
          : null
  }, [gte])

  return {
    screen,
    isMobile: screen === "mobile",
    isTablet: screen === "tablet",
    isDesktop: screen === "desktop",
    matches: match.matches,
    breakpoint: match.current,
    gte,
  }
}

declare module "@emotion/react" {
  export interface Theme extends ThemeProps {}
}

export { ThemeProvider, useTheme } from "./provider"
