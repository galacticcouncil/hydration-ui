import { useCallback, useMemo } from "react"
import { useMedia } from "react-use"

export type ScreenBreakpoint = "xs" | "sm" | "md" | "lg" | "xl"
export type ScreenType = "mobile" | "tablet" | "desktop"

export const BREAKPOINTS_TYPES = ["xs", "sm", "md", "lg", "xl"]
export const BREAKPOINTS_VALUES = ["480px", "768px", "1024px", "1280px"]

const breakpointsMap = {
  xs: "0px",
  sm: BREAKPOINTS_VALUES[0],
  md: BREAKPOINTS_VALUES[1],
  lg: BREAKPOINTS_VALUES[2],
  xl: BREAKPOINTS_VALUES[3],
}

const breakpointsEntries = Object.entries(breakpointsMap)

type ExtendedBreakpoint = `${ScreenBreakpoint}` | `max-${ScreenBreakpoint}`

export const mediaQueries = breakpointsEntries.reduce(
  (acc, [bp, width], i, arr) => {
    return {
      ...acc,
      [bp]: `@media (min-width: ${parseInt(width, 10)}px)`,
      [`max-${bp}`]: `@media (max-width: ${parseInt(arr[i + 1]?.[1] ?? "9999px", 10) - 1}px)`,
    }
  },
  {} as { [key in ExtendedBreakpoint]: string },
)

export const mq = (bp: ExtendedBreakpoint) => mediaQueries[bp]

export const useBreakpoints = () => {
  const xs = useMedia(`(min-width: ${breakpointsMap.xs})`)
  const sm = useMedia(`(min-width: ${breakpointsMap.sm})`)
  const md = useMedia(`(min-width: ${breakpointsMap.md})`)
  const lg = useMedia(`(min-width: ${breakpointsMap.lg})`)
  const xl = useMedia(`(min-width: ${breakpointsMap.xl})`)

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
