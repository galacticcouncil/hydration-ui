import React from "react"
import type { Preview } from "@storybook/react"
import { withThemeFromJSXProvider } from "@storybook/addon-themes"

import { GlobalStyles } from "../src/styles"
import { ThemeProvider, themes } from "../src/theme"
import { ThemeProvider as ThemeUIProvider } from '@theme-ui/core'

import "../src/assets/fonts/fonts.css"

const Provider = ({ children, theme }) => {
  return (
    <ThemeProvider>
      <ThemeUIProvider theme={theme}>{children}</ThemeUIProvider>
    </ThemeProvider>
  )
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
    Provider,
    GlobalStyles,
  }),
]

export default preview
