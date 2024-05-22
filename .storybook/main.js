const { default: tsconfigPaths } = require("vite-tsconfig-paths")

module.exports = {
  stories: ["../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    '@storybook/addon-styling'
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {}
  },
  async viteFinal(config) {
    if (!config.build) {
      config.build = {}
    }
    config.build.target = [
      "es2022",
      "edge89",
      "firefox89",
      "chrome89",
      "safari15",
    ]
    config.plugins = [
      tsconfigPaths(),
      ...(config.plugins.filter(({ name }) => name !== 'transform-index-html'))
    ]
    return config
  },
  docs: {
    autodocs: true
  },
};
