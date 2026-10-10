// Resolve this workspace's declared Vite version. Yarn 1's shared .bin/vite
// can otherwise point to a transitive version belonging to Vitest.
import { build } from "vite"

await build()
