import { Config, createConfig } from "@wagmi/core"
import { custom, defineChain } from "viem"

import { WsPolkadotClient } from "@/api/rpcClient"

/**
 * Hydration's EVM chain, declared here rather than imported, so this debug
 * surface owns everything it needs and pulls nothing from v1.
 */
export const hydrationEvmChain = defineChain({
  id: 222222,
  name: "Hydration",
  nativeCurrency: { name: "WETH", symbol: "WETH", decimals: 18 },
  rpcUrls: { default: { http: [] } },
})

/**
 * A read-only wagmi `Config` speaking through the app's existing papi client -
 * the same `eth_*` proxy `apps/main/src/api/rpcClient.ts` builds its viem
 * `PublicClient` on. No connector and no storage: v2's reads are the only
 * thing that uses it, and nothing here signs.
 */
export const createMoneyMarketConfig = (papiClient: WsPolkadotClient): Config =>
  createConfig({
    chains: [hydrationEvmChain],
    multiInjectedProviderDiscovery: false,
    storage: null,
    transports: {
      [hydrationEvmChain.id]: custom({
        request: ({ method, params }) =>
          papiClient._request(method, params || []),
      }),
    },
  })
