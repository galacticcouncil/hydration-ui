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
// @TODO: Implement actual validators for each platform.
export const addressValidatorFor = (
  platform: string,
): ((addr: string) => boolean) => {
  switch (platform) {
    case "near":
      return nonEmpty
    case "zec":
      return nonEmpty
    default:
      return nonEmpty
  }
}
