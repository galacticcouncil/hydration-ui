const { mergeConfig } = require("vite")
const { default: tsconfigPaths } = require("vite-tsconfig-paths")
const svgr = require("vite-plugin-svgr")

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  framework: "@storybook/react",
  core: {
    builder: "@storybook/builder-vite",
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [tsconfigPaths(), svgr()],
    })
  },
}
