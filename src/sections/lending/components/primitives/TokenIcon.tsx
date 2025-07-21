import { AssetLogo, MultipleAssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { useAssets } from "providers/assets"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { GHO_ASSET_ID } from "sections/lending/utils/ghoUtilities"
import { STRATEGY_ASSETS_BLACKLIST } from "utils/constants"
import { getAssetIdFromAddress } from "utils/evm"

interface TokenIconProps {
  address: string
  aToken?: boolean
  size?: number
  className?: string
}

export function TokenIcon({
  address,
  aToken,
  size = 24,
  ...rest
}: TokenIconProps) {
  const { currentMarketData } = useProtocolDataContext()
  const { getRelatedAToken } = useAssets()
  const { getAssetWithFallback } = useAssets()

  const isGho =
    currentMarketData.addresses.GHO_TOKEN_ADDRESS?.toLowerCase() ===
    address.toLowerCase()

  const assetId = isGho ? GHO_ASSET_ID : getAssetIdFromAddress(address)
  const meta = getAssetWithFallback(assetId)

  if (
    meta.isStableSwap &&
    meta.meta &&
    !STRATEGY_ASSETS_BLACKLIST.includes(meta.id)
  ) {
    return <MultipleAssetLogo size={size} iconId={meta.iconId} />
  }

  return (
    <Icon
      size={size}
      icon={<AssetLogo id={aToken ? getRelatedAToken(assetId)?.id : assetId} />}
      {...rest}
    />
  )
}
