// Hydration-local shim over `@railgun-community/shared-models`.
//
// Re-exports everything the vendored client uses, then **overrides
// `networkForChain`** so a Hydration chain id (`222222` on `ChainType.EVM`)
// resolves to a synthetic `Network` record built from
// `sections/privacy/utils/networks.ts`. Without this, `broadcaster-util`'s
// `cachedFeeUnavailableOrExpired` throws "Unrecognized chain" and the entire
// fee cache short-circuits.
//
// We deliberately do NOT fork the whole shared-models package — only the one
// lookup function it uses to gate on chain registry. Everything else (types,
// constants, helpers) comes straight from the upstream.

import type { Chain, Network } from "@railgun-community/shared-models"
import {
  ChainType,
  EVMGasType,
  NetworkName,
  networkForChain as upstreamNetworkForChain,
} from "@railgun-community/shared-models"

// Re-export the entire shared-models surface so vendored sources can swap
// `from '@railgun-community/shared-models'` → `from './shared-models-shim.js'`
// without losing any symbols.
export * from "@railgun-community/shared-models"

// --- Hydration chain registry --------------------------------------------
//
// Mirrors `sections/privacy/utils/networks.ts` (ACTIVE_RAILGUN_CHAIN). Kept
// **inline** here on purpose: the vendored package must not reach back into
// app code (it lives one level above `src/` in tsconfig terms), and we don't
// want a circular dependency at runtime.

export const HYDRATION_CHAIN_ID = 222222

const HYDRATION_PROXY = "0x195C5EFAa658Ac3C40DF6138F1C3B948Ed2C83D7"
const HYDRATION_RELAY_ADAPT = "0x273280a6248BFEC57bc7ef2A16E70AEBe065D737"
const HYDRATION_DEPLOYMENT_BLOCK = 244000

// Use an existing `NetworkName` enum value as the registry key. We pick
// `Hardhat` because it's already a dev-only chain key in shared-models —
// reusing it means the cache map indexed by `network.name` doesn't fight
// other networks. The string content doesn't matter for fee routing (waku
// topics are keyed by `chain.type`/`chain.id`, not network name).
const HYDRATION_NETWORK_NAME = NetworkName.Hardhat

const HYDRATION_NETWORK: Network = {
  chain: { type: ChainType.EVM, id: HYDRATION_CHAIN_ID },
  name: HYDRATION_NETWORK_NAME,
  publicName: "Hydration",
  shortPublicName: "Hydration",
  coingeckoId: "",
  baseToken: {
    symbol: "WETH",
    wrappedSymbol: "WETH",
    // Hydration's ETH precompile (see project_hydration_evm_assets memory).
    wrappedAddress: "0x0000000000000000000000000000000000000014",
    decimals: 18,
  },
  proxyContract: HYDRATION_PROXY,
  relayAdaptContract: HYDRATION_RELAY_ADAPT,
  relayAdaptHistory: [HYDRATION_RELAY_ADAPT],
  supports7702: false,
  relayAdapt7702Contract: HYDRATION_RELAY_ADAPT,
  relayAdapt7702History: [HYDRATION_RELAY_ADAPT],
  railgunRegistryContract: HYDRATION_PROXY,
  deploymentBlock: HYDRATION_DEPLOYMENT_BLOCK,
  poseidonMerkleAccumulatorV3Contract:
    "0x0000000000000000000000000000000000000000",
  poseidonMerkleVerifierV3Contract:
    "0x0000000000000000000000000000000000000000",
  tokenVaultV3Contract: "0x0000000000000000000000000000000000000000",
  deploymentBlockPoseidonMerkleAccumulatorV3: HYDRATION_DEPLOYMENT_BLOCK,
  isDevOnlyNetwork: true,
  isTestnet: true,
  defaultEVMGasType: EVMGasType.Type2,
  supportsV3: false,
}

/**
 * Patched `networkForChain`. Hands back the Hydration record for EVM/222222;
 * otherwise delegates to the upstream registry so Ethereum mainnet, Polygon,
 * etc. behave exactly as they would in stock waku-broadcaster-client.
 */
export const networkForChain = (chain: Chain): Network | undefined => {
  if (
    chain.type === ChainType.EVM &&
    chain.id === HYDRATION_CHAIN_ID
  ) {
    return HYDRATION_NETWORK
  }
  return upstreamNetworkForChain(chain)
}
