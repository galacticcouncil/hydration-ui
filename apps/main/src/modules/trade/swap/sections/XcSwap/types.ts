import type { XcSwapAsset, XcSwapChain } from "@galacticcouncil/xc-swap"

export type XcAsset = XcSwapAsset & {
  name: string
  logo: string
  balance?: string
  balanceUsd?: string
}

export type XcChain = XcSwapChain & {
  logo: string
  addressValidator: (addr: string) => boolean
}

export type XcChainAssetPair = {
  chain: XcChain
  asset: XcAsset
}
