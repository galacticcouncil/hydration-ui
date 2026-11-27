import { AssetMetadataFactory } from "@galacticcouncil/utils"
import { getWalletModeIcon, WalletMode } from "@galacticcouncil/web3-connect"
import { ChainEcosystem } from "@galacticcouncil/xc-core"

const XC_SWAP_CHAIN_ECOSYSTEMS: Record<string, ChainEcosystem> = {
  near: ChainEcosystem.Near,
  zec: ChainEcosystem.Zcash,
}

// No Bitcoin ecosystem in xc-core / the asset metadata CDN
const XC_SWAP_STATIC_LOGOS: Record<string, string> = {
  btc: getWalletModeIcon(WalletMode.Bitcoin),
}

const XC_SWAP_ASSET_LOGO_SYMBOL: Record<string, Record<string, string>> = {
  near: { wNEAR: "NEAR" },
}

export const XC_SWAP_RECIPIENT_PLACEHOLDERS: Record<string, string> = {
  zec: "t1PKtYdJJHhc3Pxowmznkg7vdTwnhEsCvR4",
  btc: "bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",
  near: "alice.near",
}

export const getXcSwapChainLogoUrl = (chainKey: string): string => {
  const staticLogo = XC_SWAP_STATIC_LOGOS[chainKey]
  if (staticLogo) return staticLogo

  const ecosystem = XC_SWAP_CHAIN_ECOSYSTEMS[chainKey]
  if (!ecosystem) return ""
  return AssetMetadataFactory.getInstance().getChainLogoSrc(chainKey, ecosystem)
}

export const getXcSwapAssetLogoUrl = (
  chainKey: string,
  symbol: string,
): string => {
  const staticLogo = XC_SWAP_STATIC_LOGOS[chainKey]
  if (staticLogo) return staticLogo

  const ecosystem = XC_SWAP_CHAIN_ECOSYSTEMS[chainKey]
  if (!ecosystem) return ""

  const logoSymbol = XC_SWAP_ASSET_LOGO_SYMBOL[chainKey]?.[symbol] ?? symbol

  return AssetMetadataFactory.getInstance().getAssetLogoSrc(
    chainKey,
    logoSymbol,
    ecosystem,
  )
}
