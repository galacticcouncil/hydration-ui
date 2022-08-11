import { theme } from "../src/theme"

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
