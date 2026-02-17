import type { LogoProps } from "@galacticcouncil/ui/components/Logo"

import { ExternalAssetLogo } from "@/components/ExternalAssetLogo"
import { resolveAssetIcon } from "@/modules/xcm/history/utils/assets"

type JourneyAssetLogoProps = LogoProps & {
  assetKey: string
}

export function JourneyAssetLogo({
  assetKey,
  ...props
}: JourneyAssetLogoProps) {
  const iconData = resolveAssetIcon(assetKey)
  if (!iconData) return null
  return (
    <ExternalAssetLogo
      id={iconData.assetId}
      ecosystem={iconData.ecosystem}
      chainId={iconData.chainId}
      {...props}
    />
  )
}
