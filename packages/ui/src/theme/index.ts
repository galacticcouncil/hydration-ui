export type ThemeProps = typeof light
export type ThemeName = keyof typeof themes

const light = {
  colors: {
    background: "#f1f5f9",
    text: "#0f172a",
    primary: "#3b82f6",
    secondary: "#334155",
  },
}

const dark = {
  colors: {
    background: "#1e293b",
    text: "#f1f5f9",
    primary: "#8b5cf6",
    secondary: "#475569",
  },
} satisfies ThemeProps

export const themes = {
  light,
  dark,
}

declare module "@emotion/react" {
  export interface Theme extends ThemeProps {}
}

export { ThemeProvider, useTheme } from "./provider"
