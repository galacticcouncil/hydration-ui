import type { LogoProps } from "@galacticcouncil/ui/components/Logo"

import { useAssetMetadata } from "@/api/metadata"
import { ExternalAssetLogo } from "@/components/ExternalAssetLogo"
import { resolveAssetIcon } from "@/modules/xcm/history/utils/assets"
import { fromXcScanChainId } from "@/modules/xcm/history/utils/journey"

type JourneyAssetLogoProps = LogoProps & {
  assetKey: string
}

export function JourneyAssetLogo({
  assetKey,
  ...props
}: JourneyAssetLogoProps) {
  const metadata = useAssetMetadata()
  const { xcscanAssetUrnMap } = metadata.getAssetsMetadata()
  const iconData = resolveAssetIcon(xcscanAssetUrnMap[assetKey] || assetKey)
  if (!iconData) return null
  return (
    <ExternalAssetLogo
      id={iconData.assetId}
      ecosystem={iconData.ecosystem}
      chainId={fromXcScanChainId(iconData)}
      {...props}
    />
  )
}
