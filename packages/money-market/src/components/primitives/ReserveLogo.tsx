import { AssetLogoProps } from "@galacticcouncil/ui/components"
import { getAssetIdFromAddress, stringEquals } from "@galacticcouncil/utils"

import { useProtocolDataContext } from "@/hooks"
import { useSharedDependencies } from "@/ui-config/SharedDependenciesProvider"
import { GHO_ASSET_ID } from "@/utils"

export type ReserveLogoProps = {
  address: string
  size?: AssetLogoProps["size"]
  className?: string
}

export const ReserveLogo: React.FC<ReserveLogoProps> = ({
  address,
  ...props
}) => {
  const { currentMarketData } = useProtocolDataContext()
  const { AssetLogo } = useSharedDependencies()

  const isGho = stringEquals(
    currentMarketData.addresses.GHO_TOKEN_ADDRESS ?? "",
    address,
  )
  const assetId = isGho ? GHO_ASSET_ID : getAssetIdFromAddress(address)

  return <AssetLogo id={assetId} {...props} />
}
