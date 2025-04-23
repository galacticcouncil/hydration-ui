import { theme } from "../src/theme"

import { Global } from "@emotion/react"
import { withThemeFromJSXProvider } from "@storybook/addon-styling"
import { GlobalStyle } from "../src/components/GlobalStyle"
import "../src/i18n/i18n"
import "react-loading-skeleton/dist/skeleton.css"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SkeletonTheme } from "react-loading-skeleton"

const GlobalStyles = () => <Global styles={GlobalStyle} />

const client = new QueryClient()

const withQueryClient = (Story) => (
  <QueryClientProvider client={client}>
    <Story />
  </QueryClientProvider>
)
const withSkeletonTheme = (Story) => (
  <SkeletonTheme
    baseColor={`rgba(${theme.rgbColors.white}, 0.12)`}
    highlightColor={`rgba(${theme.rgbColors.white}, 0.24)`}
    borderRadius={4}
  >
    <Story />
  </SkeletonTheme>
)

const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    docs: {
      theme: {
        base: "dark",
        fontBase: "Arial, Helvetica, sans-serif",
        // Typography
        colorPrimary: "#ffffff",
        colorSecondary: "#ffffff",

        // UI
        appBg: theme.colors.bg,
        appContentBg: theme.colors.bg,
        appPreviewBg: theme.colors.bg,
        appBorderColor: theme.colors.darkBlue400,
        appBorderRadius: 4,

        // Text colors
        textColor: "#ffffff",
        textInverseColor: "#000000",

        // Toolbar default and active colors
        barTextColor: "#ffffff",
        barSelectedColor: "#ffffff",
        barBg: theme.colors.bg,

        // Form colors
        inputBg: theme.colors.bg,
        inputBorder: theme.colors.darkBlue400,
        inputTextColor: "#ffffff",
        inputBorderRadius: 4,
      },
    },
    backgrounds: {
      disable: true,
      default: "dark",
    },
  },
  tags: ["autodocs"]
}

export const decorators = [
  withQueryClient,
  withSkeletonTheme,
  withThemeFromJSXProvider({
    GlobalStyles,
  }),
]

export default preview
