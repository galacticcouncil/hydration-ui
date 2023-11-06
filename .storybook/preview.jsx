import { theme } from "../src/theme"

import { Global } from "@emotion/react"
import { withThemeFromJSXProvider } from "@storybook/addon-styling"
import { GlobalStyle } from "../src/components/GlobalStyle"
import "../src/i18n/i18n"
import "react-loading-skeleton/dist/skeleton.css"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SkeletonTheme } from "react-loading-skeleton";

const GlobalStyles = () => (
  <Global styles={GlobalStyle} />
)

const client = new QueryClient()

const withQueryClient = (Story) => (
  <QueryClientProvider client={client}>
      <Story />
  </QueryClientProvider>
);
const withSkeletonTheme = (Story) => (
  <SkeletonTheme
    baseColor={`rgba(${theme.rgbColors.white}, 0.12)`}
    highlightColor={`rgba(${theme.rgbColors.white}, 0.24)`}
    borderRadius={4}
  >
    <Story />
  </SkeletonTheme>
);

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
  withQueryClient,
  withSkeletonTheme,
  withThemeFromJSXProvider({
    GlobalStyles,
  }),
]
