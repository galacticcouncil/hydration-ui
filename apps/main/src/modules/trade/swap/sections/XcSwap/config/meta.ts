import { AssetMetadataFactory } from "@galacticcouncil/utils"
import { ChainEcosystem } from "@galacticcouncil/xc-core"

const XC_SWAP_CHAIN_ECOSYSTEMS: Record<string, ChainEcosystem> = {
  near: ChainEcosystem.Near,
  zec: ChainEcosystem.Zcash,
}

const XC_SWAP_ASSET_LOGO_SYMBOL: Record<string, Record<string, string>> = {
  near: { wNEAR: "NEAR" },
}

export const XC_SWAP_RECIPIENT_PLACEHOLDERS: Record<string, string> = {
  zec: "t1PKtYdJJHhc3Pxowmznkg7vdTwnhEsCvR4",
  near: "alice.near",
}

export const getXcSwapChainLogoUrl = (chainKey: string): string => {
  const ecosystem = XC_SWAP_CHAIN_ECOSYSTEMS[chainKey]
  if (!ecosystem) return ""
  return AssetMetadataFactory.getInstance().getChainLogoSrc(chainKey, ecosystem)
}

export const getXcSwapAssetLogoUrl = (
  chainKey: string,
  symbol: string,
): string => {
  const ecosystem = XC_SWAP_CHAIN_ECOSYSTEMS[chainKey]
  if (!ecosystem) return ""

  const logoSymbol = XC_SWAP_ASSET_LOGO_SYMBOL[chainKey]?.[symbol] ?? symbol

  return AssetMetadataFactory.getInstance().getAssetLogoSrc(
    chainKey,
    logoSymbol,
    ecosystem,
  )
}
