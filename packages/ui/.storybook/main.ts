import { createRequire } from "node:module";
import { join, dirname } from "path"
import type { StorybookConfig } from "@storybook/react-vite"
import react from "@vitejs/plugin-react"
import svgr from "vite-plugin-svgr"
import wasm from "vite-plugin-wasm"
import babel from "@rolldown/plugin-babel"

const require = createRequire(import.meta.url);

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, "package.json")))
}



const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-themes"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-mcp"),
  ],
  framework: getAbsolutePath("@storybook/react-vite"),
  core: {
    builder: '@storybook/builder-vite',
  },
  async viteFinal(config) {
    const { mergeConfig } = await import('vite');
    return mergeConfig(config, {
      resolve: {
        tsconfigPaths: true,
      },
      plugins: [
        react({
          jsxImportSource: "@galacticcouncil/ui/jsx",
        }),
        babel({
          include: /\.[jt]sx?$/,
          exclude: /node_modules/,
          plugins: ["@emotion/babel-plugin"],
        }),
        wasm(),
        svgr({
          svgrOptions: {
            svgo: true,
          },
        })
      ]
    })
  },
}
export default config
