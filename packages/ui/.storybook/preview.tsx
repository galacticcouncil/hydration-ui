import React from "react"
import type { Preview } from "@storybook/react"
import { ThemeProvider as EmotionThemeProvider } from "@emotion/react"
import { withThemeFromJSXProvider } from "@storybook/addon-themes"

import { GlobalStyles } from "../src/styles"
import { themes } from "../src/theme"

const ThemeProvider = ({ children, theme }) => {
  return <EmotionThemeProvider theme={theme}>{children}</EmotionThemeProvider>
}

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export const decorators = [
  withThemeFromJSXProvider({
    themes,
    defaultTheme: "light",
    Provider: ThemeProvider,
    GlobalStyles,
  }),
]

export default preview
