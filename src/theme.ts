import { keys } from "utils/helpers"

const colors = {
  white: "#ffffff",
  black: "#000000",
  primary500: "#49E49F",
  primary450: "#4CF3A8",
  primary400: "#4FFFB0",
  primary300: "#8AFFCB",
  primary200: "#B8FFDF",
  primary100: "#DAFFEE",
  blue100: "#D5E8FF",
  blue200: "#9CC1F6",
  blue300: "#467AF0",
  blue400: "#4155C2",
  blue500: "#3C4B91",
  yellow100: "#F5F0DE",
  yellow200: "#F4E7B0",
  yellow300: "#F0DA73",
  yellow400: "#F7BF06",
  yellow500: "#E5B30B",
  orange100: "#FFE2C3",
  orange200: "#FBCD9C",
  orange300: "#F5A855",
  orange400: "#FF931E",
  orange450: "#F38D1D",
  orange500: "#E18521",
  pink100: "#FBE3EC",
  pink200: "#FCC9DC",
  pink300: "#FFA6C7",
  pink400: "#FF7BAC",
  pink500: "#D87398",
  red100: "#FFD7D7",
  red200: "#FFAEAE",
  red300: "#FF8A8A",
  red400: "#FF6868",
  red500: "#DA5D5D",
  backgroundGray1000: "#1C1A1F",
  backgroundGray900: "#211F24",
  backgroundGray800: "#29292D",
  backgroundGray700: "#3E3E4B",
  backgroundGray600: "#51515F",
  backgroundGray500: "#686876",
  iconButtonGrey: "#3D3D3D",
  neutralGray500: "#787E82",
  neutralGray400: "#A2B0B8",
  neutralGray300: "#9EA9B1",
  neutralGray200: "#D1DEE8",
  neutralGray100: "#E5ECF1",
  darkGreen: "#1D2D26",
  darkGray: "#1A171B",
  error: "#FF8A8A",
  graphGradient0: "#4FFFB0",
  graphGradient50: "#B3FF8F",
  graphGradient100: "#FF984E",
} as const

const gradients = {
  primaryGradient:
    "linear-gradient(90deg, #4FFFB0 1.27%, #B3FF8F 48.96%, #FF984E 104.14%), linear-gradient(90deg, #4FFFB0 1.27%, #A2FF76 53.24%, #FF984E 104.14%), linear-gradient(90deg, #FFCE4F 1.27%, #4FFFB0 104.14%)",
  verticalGradient:
    "radial-gradient(89.2% 89.2% at 50.07% 87.94%, #008A69 0%, #262F31 88.52%), #2C3335;",
  simplifiedGradient: "90deg, #4fffb0, #b3ff8f, #ff984e",
  cardGradient:
    "linear-gradient(180deg, #1C2527 0%, #14161A 80.73%, #121316 100%)",
  mobNavigationGradient: "linear-gradient(0deg, #141414, #141414), #1C1A1F",
} as const

const zIndices = {
  chainedIcon: 1,
  boxSwitch: 1,
  header: 5,
  backdrop: 9,
  modal: 10,
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
}
