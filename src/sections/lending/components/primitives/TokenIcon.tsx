import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { A_TOKEN_UNDERLYING_ID_MAP } from "sections/lending/ui-config/aTokens"
import { getAssetIdFromAddress } from "utils/evm"

interface TokenIconProps {
  address: string
  aToken?: boolean
  size?: number
  className?: string
}

const REVERSE_A_TOKEN_UNDERLYING_ID_MAP = Object.fromEntries(
  Object.entries(A_TOKEN_UNDERLYING_ID_MAP).map(([key, value]) => [value, key]),
)

export function TokenIcon({
  address,
  aToken,
  size = 24,
  ...rest
}: TokenIconProps) {
  const assetId = getAssetIdFromAddress(address)

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
