import React from "react"
import type { Preview } from "@storybook/react"
import { withThemeFromJSXProvider } from "@storybook/addon-themes"

import { GlobalStyles } from "../src/styles"
import { themes } from "../src/theme"
import { ThemeProvider as ThemeUIProvider } from '@theme-ui/core'

import "../src/assets/fonts/fonts.css"

const ThemeProvider = ({ children, theme }) => {
  return <ThemeUIProvider theme={theme}>{children}</ThemeUIProvider>
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
