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
  const logoId =
    asset.logoId ?? (asset.id !== undefined ? String(asset.id) : undefined)

  if (logoId) {
    return <AssetLogo id={logoId} size={size} />
  }

  const logo = getXcSwapAssetLogoUrl(asset.key) || asset.logo

  return <XcLogo src={logo} size={size} />
}
