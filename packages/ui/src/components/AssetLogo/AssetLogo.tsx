import { PlaceholderAssetLogo, TriangleAlert } from "@/assets/icons"
import { Box, Tooltip } from "@/components"

import {
  AssetLogoProps,
  SAssetBadge,
  SAssetLogo,
  SBadgeSlot,
  SChainLogo,
  SPlaceholder,
  TBadge,
} from "./AssetLogo.styled"

export const AssetLogo = ({
  src,
  size = "medium",
  assetId,
  chainSrc,
  badge,
  badgeTooltip,
}: AssetLogoProps) => {
  if (!src || !assetId)
    return <SPlaceholder component={PlaceholderAssetLogo} size={size} />

  return (
    <Box sx={{ position: "relative", width: "fit-content" }}>
      <SAssetLogo
        loading="lazy"
        src={src}
        alt={assetId}
        withChainLogo={!!chainSrc}
        size={size}
      />
      {chainSrc && <SChainLogo loading="lazy" src={chainSrc} alt={assetId} />}

      <Badge badge={badge} tooltip={badgeTooltip} />
    </Box>
  )
}

const Badge = ({ badge, tooltip }: { badge?: TBadge; tooltip?: string }) => {
  if (!badge) return null

  const BadgeComp = (
    <SAssetBadge component={TriangleAlert} size="100%" type={badge} />
  )

  return (
    <SBadgeSlot>
      {tooltip ? <Tooltip text={tooltip}>{BadgeComp}</Tooltip> : BadgeComp}
    </SBadgeSlot>
  )
}
