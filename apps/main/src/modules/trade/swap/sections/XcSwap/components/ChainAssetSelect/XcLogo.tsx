import { AssetLogo as AssetLogoPrimitive } from "@galacticcouncil/ui/components"
import { Logo, LogoProps } from "@galacticcouncil/ui/components/Logo"

import { AssetLogo } from "@/components/AssetLogo"
import { getXcSwapAssetLogoUrl } from "@/modules/trade/swap/sections/XcSwap/config/meta"
import { XcAsset } from "@/modules/trade/swap/sections/XcSwap/types"

export const XcLogo: React.FC<LogoProps> = ({ size = "medium", ...props }) => (
  <Logo size={size} {...props} />
)

export const XcAssetLogo: React.FC<{
  asset: XcAsset
  size?: LogoProps["size"]
  sideChainSrc?: string
  collapsed?: boolean
}> = ({ asset, size = "medium", sideChainSrc, collapsed }) => {
  const logoId = asset.id !== undefined ? String(asset.id) : undefined
  const side = sideChainSrc
    ? ({ chainSrc: sideChainSrc, chainPosition: "side" } as const)
    : {}

  if (logoId) {
    return <AssetLogo id={logoId} size={size} collapsed={collapsed} {...side} />
  }

  const logo = getXcSwapAssetLogoUrl(asset.chain, asset.symbol) || asset.logo

  if (sideChainSrc) {
    return <AssetLogoPrimitive src={logo} size={size} {...side} />
  }

  return <XcLogo src={logo} size={size} />
}
