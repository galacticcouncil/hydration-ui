import { theme } from "../src/theme"

import { Global } from "@emotion/react"
import { withThemeFromJSXProvider } from "@storybook/addon-styling"
import { GlobalStyle } from "../src/components/GlobalStyle"
import "../src/i18n/i18n"

const GlobalStyles = () => {
  return (
    <Global styles={GlobalStyle} />
  )
}

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
