import { NearAddr, ZcashAddr } from "@galacticcouncil/utils"
import type { XcSwapPlatform } from "@galacticcouncil/xc-swap"

export type XcAsset = {
  key: string
  symbol: string
  name: string
  decimals: number
  logo: string
  logoId?: string
  // Optional balance/USD used by the dest ChainAssetSelect; unset on origin assets.
  balance?: string
  balanceUsd?: string
  // Origin assets only — Hydration runtime id + ERC-20 precompile address.
  id?: number
  address?: `0x${string}`
  // Destination assets only — 1Click / Defuse asset id.
  oneClickId?: string
}

export type XcChain = {
  key: string
  name: string
  logo: string
  // Mirrors XcSwapChain.platform — "hydration" means same-chain (Omnipool).
  platform: string
  addressValidator: (addr: string) => boolean
}

export type XcChainAssetPair = {
  chain: XcChain
  asset: XcAsset
}

const nonEmpty = (addr: string) => addr.trim().length > 0

// Picks the recipient validator for a destination chain's platform.
// Exhaustive over XcSwapPlatform so a newly-added bridge destination fails to
// compile here instead of silently accepting any recipient string.
export const addressValidatorFor = (
  platform: XcSwapPlatform,
): ((addr: string) => boolean) => {
  switch (platform) {
    case "near":
      return NearAddr.isValid
    case "zec":
      return ZcashAddr.isValid
    case "hydration":
      // Same-chain swaps skip destination-address validation upstream
      // (useXcSwapForm: isCrossChain === false), so this is never exercised.
      return nonEmpty
  }
}
