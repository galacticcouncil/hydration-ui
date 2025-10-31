import {
  EvmAddr,
  HYDRATION_CHAIN_KEY,
  isAnyEvmChain,
  isParachain,
  SolanaAddr,
  Ss58Addr,
  SuiAddr,
} from "@galacticcouncil/utils"
import { WalletMode } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { AnyChain, Asset, ChainEcosystem } from "@galacticcouncil/xcm-core"
import { filter, pipe, prop, sortBy } from "remeda"

const KUSAMA_CHAINS_WHITELIST = ["kusama", "assethub_kusama"]

const ethereum = chainsMap.get("ethereum")!
// @ts-expect-error override rpc for testing
ethereum.rpcs = ["https://ethereum-rpc.publicnode.com"]

export const XCM_CHAINS = pipe(
  [...chainsMap.values()],
  filter((c) => !c.isTestChain),
  filter(
    (c) =>
      c.ecosystem === ChainEcosystem.Polkadot ||
      c.isEvmChain() ||
      c.isSolana() ||
      c.isSui() ||
      (c.ecosystem === ChainEcosystem.Kusama &&
        KUSAMA_CHAINS_WHITELIST.includes(c.key)),
  ),
  sortBy(prop("name")),
)

/* export const getValidDestinationChains = (
  srcChain: AnyChain,
  srcAsset: Asset,
): AnyChain[] => {
  return XCM_CHAINS.filter((chain) => {
    if (chain.key === srcChain.key) return false

    const chainAssets = chain.assetsData
    if (!chainAssets) return false

    // Check if any asset on this chain matches the source asset
    return Array.from(chainAssets.values()).some(
      (chainAssetData) => chainAssetData.asset.key === srcAsset.key,
    )
  })
} */

/* export const getValidDestinationAssets = (
  srcAsset: Asset,
  destChain: AnyChain,
): Asset[] => {
  const chainAssets = destChain.assetsData
  if (!chainAssets) return []

  return Array.from(chainAssets.values())
    .filter((chainAssetData) => chainAssetData.asset.key === srcAsset.key)
    .map((chainAssetData) => chainAssetData.asset)
}
 */
export type XcmFormDefaults = {
  srcChain: AnyChain | null
  srcAsset: Asset | null
  destChain: AnyChain | null
  destAsset: Asset | null
}

export const getXcmFormDefaults = (address: string): XcmFormDefaults => {
  // Determine address type and select appropriate source chain
  let srcChain: AnyChain | null = null

  if (Ss58Addr.isValid(address)) {
    // SS58 address -> assethub
    srcChain = chainsMap.get("assethub") || null
  } else if (EvmAddr.isValid(address)) {
    // H160 address -> ethereum
    srcChain = chainsMap.get("ethereum") || null
  } else if (SolanaAddr.isValid(address)) {
    // Solana address -> solana
    srcChain = chainsMap.get("solana") || null
  } else if (SuiAddr.isValid(address)) {
    // Sui address -> sui
    srcChain = chainsMap.get("sui") || null
  }

  // Get first asset for source chain
  let srcAsset: Asset | null = null
  if (srcChain?.assetsData) {
    const firstAssetData = Array.from(srcChain.assetsData.values())[0]
    srcAsset = firstAssetData?.asset || null
  }

  // Destination chain is always hydration
  const destChain = chainsMap.get("hydration") || null

  // Destination asset is the same as source asset
  const destAsset = srcAsset

  return {
    srcChain,
    srcAsset,
    destChain,
    destAsset,
  }
}

export const getWalletModeByChain = (chain: AnyChain) => {
  if (chain.key === HYDRATION_CHAIN_KEY) {
    return WalletMode.SubstrateEVM
  }

  if (isParachain(chain)) {
    return chain.usesH160Acc ? WalletMode.SubstrateH160 : WalletMode.Substrate
  }

  if (isAnyEvmChain(chain)) {
    return WalletMode.EVM
  }

  if (chain.isSolana()) {
    return WalletMode.Solana
  }

  if (chain.isSui()) {
    return WalletMode.Sui
  }

  return WalletMode.Default
}
