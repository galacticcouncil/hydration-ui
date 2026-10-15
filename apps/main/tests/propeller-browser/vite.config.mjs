import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
const local = (name) => fileURLToPath(new URL(name, import.meta.url))
const hooks = local("./hooks.ts")
const ui = local("./ui.tsx")
const imports = [
  "@/api/balances",
  "@/providers/assetsProvider",
  "@/providers/rpcProvider",
  "@/modules/strategies/propeller/hooks/useVaultReads",
  "@/modules/strategies/propeller/hooks/useVaultWrites",
  "@/modules/strategies/propeller/hooks/usePropellerVaults",
  "@tanstack/react-query",
]
export default defineConfig({
  root: local("."),
  resolve: {
    alias: [
      ...imports.map((find) => ({ find, replacement: hooks })),
      ...[
        "@galacticcouncil/ui/components",
        "@galacticcouncil/ui/assets/icons",
        "@galacticcouncil/ui/utils",
        "@/components/AssetSelect/AssetSelect",
        "@/components/AuthorizedAction/AuthorizedAction",
      ].map((find) => ({ find, replacement: ui })),
      { find: "react-i18next", replacement: local("./i18n.ts") },
      { find: /^@\/i18n$/, replacement: local("./i18n.ts") },
      { find: "@/utils/validators", replacement: local("./validators.ts") },
      { find: "@/utils/formatting", replacement: local("./formatting.ts") },
      { find: "@", replacement: local("../../src") },
    ],
  },
  server: {
    host: "127.0.0.1",
    port: 4179,
    fs: { allow: [local("../../../..")] },
  },
})
