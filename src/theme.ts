import { keys } from "utils/helpers"

const colors = {
  white: "#ffffff",
  black: "#000000",
  pink100: "#FFBBD6",
  pink200: "#FEA6CA",
  pink300: "#FF99C2",
  pink400: "#FF8BBA",
  pink500: "#FF67A4",
  pink600: "#FC408C",
  pink700: "#F6297C",
  brightBlue100: "#A6DDFF",
  brightBlue200: "#9CDDFF",
  brightBlue300: "#85D1FF",
  brightBlue400: "#3192CD",
  brightBlue500: "#1A7AB4",
  brightBlue600: "#57B3EB",
  brightBlue700: "#009FFF",
  vibrantBlue100: "#7889FF",
  vibrantBlue200: "#5F73FE",
  vibrantBlue300: "#485EF8",
  vibrantBlue400: "#2B40C8",
  vibrantBlue500: "#152DC7",
  vibrantBlue600: "#0A1FA7",
  vibrantBlue700: "#031586",
  darkBlue400: "#333750",
  darkBlue500: "#000524",
  darkBlue600: "#00041D",
  darkBlue700: "#000316",
  darkBlue800: "#00020E",
  darkBlue900: "#000107",
  darkBlue1000: "#000524",
  basic100: "#ECEDEF",
  basic200: "#8F90A6",
  basic300: "#BBBEC9",
  basic400: "#B2B6C5",
  basic500: "#878C9E",
  basic600: "#676C80",
  basic700: "#5D6175",
  basic800: "#26282F",
  basic900: "#00041D",
  warning: "#F5A855",
  error: "#FF8A8A",
  red100: "#EF0303",
  red700: "#FF0000",
  green100: "#03EF97",
  green600: "#30FFB1",
  iconGray: "#BDCCD4",
} as const

const gradients = {
  background: "linear-gradient(180deg, #00579F 0%, #023B6A 25%, #001736 100%)",
  pink: "linear-gradient(90deg, #FC408C 0%, #15161C 100%)",
  lightBlue: "linear-gradient(90deg, #57B3EB 0%, #15161C 100%)",
  darkBlue: "linear-gradient(90deg, #0A1FA7 0%, #15161C 100%)",
  darkBlueLight: "linear-gradient(90deg, #0A1FA7 0%, #57B3EB 100%)",
  pinkLightBlue: "linear-gradient(90deg, #FC408C 0%, #57B3EB 100%)",
  pinkLightPink: "linear-gradient(90deg, #FC408C 30%, #EFB0FF 100%)",
  spinner:
    "conic-gradient(from 90.65deg at 50% 50%, #FC408C -1.87deg, rgba(10, 13, 26, 0) 117.39deg, #00C2FF 185.07deg, #004DE2 219.37deg, #FC408C 294.78deg, #FC408C 358.13deg, rgba(10, 13, 26, 0) 477.39deg)",
} as const

const shadows = {
  boxShadow: "3px 3px 0px rgba(199, 199, 199, 0.27)",
  modal:
    "0px 0px 100px rgba(84, 155, 194, 0.12), 6px 6px 0px rgba(102, 181, 255, 0.19)",
} as const

const zIndices = {
  chainedIcon: 1,
  boxSwitch: 1,
  header: 5,
  backdrop: 9,
  modal: 10,
  toast: 11,
} as const

const breakpoints = {
  sm: 768,
  md: 1024,
  lg: 1440,
  xl: 1536,
} as const
type BreakpointKey = keyof typeof breakpoints

const mediaGte = <Key extends BreakpointKey>(key: Key) =>
  `(min-width: ${breakpoints[key]}px)` as const
const mediaLt = <Key extends BreakpointKey>(key: Key) =>
  `(max-width: calc(${breakpoints[key]}px - 1px))` as const

const viewport = {
  gte: Object.fromEntries(keys(breakpoints).map((i) => [i, mediaGte(i)])) as {
    [Key in BreakpointKey]: ReturnType<typeof mediaGte<Key>>
  },
  lt: Object.fromEntries(keys(breakpoints).map((i) => [i, mediaLt(i)])) as {
    [Key in BreakpointKey]: ReturnType<typeof mediaLt<Key>>
  },
} as const

// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
const hexToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const tmp = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b)

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(tmp)
  return [
    parseInt(result![1], 16),
    parseInt(result![2], 16),
    parseInt(result![3], 16),
  ].join(",")
}

const rgbColors = Object.fromEntries(
  keys(colors).map((i) => [i, hexToRgb(colors[i])]),
) as {
  [Key in keyof typeof colors]: string
}

const transitions = {
  slow: "0.30s ease-in-out",
  default: "0.15s ease-in-out",
} as const

export const theme = {
  colors,
  gradients,
  rgbColors,
  transitions,
  zIndices,
  viewport,
  shadows,
}
