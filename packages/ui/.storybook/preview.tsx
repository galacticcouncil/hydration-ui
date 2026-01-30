import React from "react"
import type { Preview } from "@storybook/react-vite"
import { withThemeFromJSXProvider } from "@storybook/addon-themes"
import * as theming from "storybook/theming"
import { GlobalStyles } from "../src/styles"
import { css, Global } from "@emotion/react"
import { ThemeProvider, themes } from "../src/theme"
import { ThemeProvider as ThemeUIProvider } from "@theme-ui/core"

import "../src/assets/fonts/fonts.css"

const Provider = ({ children, theme }) => {
  return (
    <ThemeProvider>
      <Global
        styles={css`
          .docs-story {
            background-color: ${theme.surfaces.themeBasePalette.background};
          }
        `}
      />
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
    docs: {
      toc: true,
      theme: theming.themes.dark
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
