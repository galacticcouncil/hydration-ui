import { theme } from "../src/theme"

import { Global, css } from "@emotion/react"
import { withThemeFromJSXProvider } from "@storybook/addon-styling"
import { GlobalStyle } from "../src/components/GlobalStyle"

const GlobalStyles = () => (
  <Global styles={GlobalStyle} />
)

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  backgrounds: {
    default: "dark",
    value: [
      { name: "dark", value: theme.colors.backgroundGray1000 },
      { name: "light", value: theme.colors.white },
    ],
  },
}

export const decorators = [
  withThemeFromJSXProvider({
    GlobalStyles,
  }),
]
