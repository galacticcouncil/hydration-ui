const { mergeConfig } = require("vite");
const { default: tsconfigPaths } = require("vite-tsconfig-paths");

module.exports = {
  stories: ["../src/**/*.stories.mdx", "../src/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: ["@storybook/addon-links", "@storybook/addon-essentials", "@storybook/addon-interactions", "@storybook/addon-mdx-gfm", '@storybook/addon-styling'],
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
    return mergeConfig(config, {
      plugins: [tsconfigPaths()]
    });
  },
  docs: {
    autodocs: true
  }
};
