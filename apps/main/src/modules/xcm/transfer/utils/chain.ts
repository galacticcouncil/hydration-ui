import {
  EvmAddr,
  HYDRATION_CHAIN_KEY,
  isAnyEvmChain,
  isParachain,
  SolanaAddr,
  Ss58Addr,
  SuiAddr,
} from "@galacticcouncil/utils"
import { Account, WalletMode } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { AnyChain, Asset, ChainEcosystem } from "@galacticcouncil/xcm-core"
import { filter, pipe, prop, sortBy } from "remeda"

import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

const KUSAMA_CHAINS_WHITELIST = ["kusama", "assethub_kusama"]

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

export const getXcmFormDefaults = (
  account: Account | null,
): Pick<
  XcmFormValues,
  | "srcChain"
  | "srcAsset"
  | "destChain"
  | "destAsset"
  | "destAddress"
  | "destAccount"
> => {
  const address = account?.rawAddress ?? ""

  const srcChain: AnyChain | null = (() => {
    switch (true) {
      case Ss58Addr.isValid(address):
        return chainsMap.get("assethub") || null
      case EvmAddr.isValid(address):
        return chainsMap.get("ethereum") || null
      case SolanaAddr.isValid(address):
        return chainsMap.get("solana") || null
      case SuiAddr.isValid(address):
        return chainsMap.get("sui") || null
      default:
        return null
    }
  })()

  const srcAsset: Asset | null = srcChain?.assetsData
    ? Array.from(srcChain.assetsData.values())[0]?.asset || null
    : null

  const destChain = chainsMap.get("hydration") || null

  const destAsset = srcAsset

  return {
    srcChain,
    srcAsset,
    destChain,
    destAsset,
    destAddress: address,
    destAccount: account,
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
