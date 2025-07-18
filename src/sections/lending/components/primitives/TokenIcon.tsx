import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { GHO_ASSET_ID } from "sections/lending/utils/ghoUtilities"
import { getAssetIdFromAddress } from "utils/evm"
import { useAssets } from "providers/assets"

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

  const isGho =
    currentMarketData.addresses.GHO_TOKEN_ADDRESS?.toLowerCase() ===
    address.toLowerCase()

  const assetId = isGho ? GHO_ASSET_ID : getAssetIdFromAddress(address)

  return (
    <Icon
      size={size}
      icon={<AssetLogo id={aToken ? getRelatedAToken(assetId)?.id : assetId} />}
      {...rest}
    />
  )
}
