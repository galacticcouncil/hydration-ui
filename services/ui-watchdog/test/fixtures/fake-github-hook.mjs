// Preload for a black-box src/main.mjs: swaps src/github.mjs for
// ./fake-github.mjs. Use with node --import <this file>.
import { register } from "node:module"

register("./fake-github-loader.mjs", import.meta.url)
