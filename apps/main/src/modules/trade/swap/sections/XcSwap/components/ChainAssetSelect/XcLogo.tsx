import { Logo, LogoProps } from "@galacticcouncil/ui/components/Logo"

import { AssetLogo } from "@/components/AssetLogo"
import { getXcSwapAssetLogoUrl } from "@/config/xcSwap"
import { XcAsset } from "@/modules/trade/swap/sections/XcSwap/data/mock"

export const XcLogo: React.FC<LogoProps> = ({ size = "medium", ...props }) => (
  <Logo size={size} {...props} />
)

export const XcAssetLogo: React.FC<{
  asset: XcAsset
  size?: LogoProps["size"]
}> = ({ asset, size = "medium" }) => {
  if (asset.logoId) {
    return <AssetLogo id={asset.logoId} size={size} />
  }

  const logo = getXcSwapAssetLogoUrl(asset.key) || asset.logo

  return <XcLogo src={logo} size={size} />
}
