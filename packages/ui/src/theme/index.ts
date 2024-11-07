export type ThemeProps = typeof light
export type ThemeName = keyof typeof themes

import darkJSON from "./tokens/Core tokens-Dark-Desktop.json"
import lightJSON from "./tokens/Core tokens-Light-Desktop.json"

const light = lightJSON
const dark = darkJSON as unknown as ThemeProps

export const themes = {
  light,
  dark,
}

declare module "@emotion/react" {
  export interface Theme extends ThemeProps {}
}

export { ThemeProvider, useTheme } from "./provider"
