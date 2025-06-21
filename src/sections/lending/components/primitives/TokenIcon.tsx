import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { REVERSE_A_TOKEN_UNDERLYING_ID_MAP } from "sections/lending/ui-config/aTokens"
import { GHO_ASSET_ID } from "sections/lending/utils/ghoUtilities"
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

  const isGho =
    currentMarketData.addresses.GHO_TOKEN_ADDRESS?.toLowerCase() ===
    address.toLowerCase()

  const assetId = isGho ? GHO_ASSET_ID : getAssetIdFromAddress(address)

  return (
    <Icon
      size={size}
      icon={
        <AssetLogo
          id={aToken ? REVERSE_A_TOKEN_UNDERLYING_ID_MAP[assetId] : assetId}
        />
      }
      {...rest}
    />
  )
}
