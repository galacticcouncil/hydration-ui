import { AssetLogo, AssetLogoProps } from "@galacticcouncil/ui/components"
import {
  AssetMetadataFactory,
  getAssetIdFromAddress,
  HYDRATION_PARACHAIN_ID,
  stringEquals,
} from "@galacticcouncil/utils"

import { useProtocolDataContext } from "@/hooks"
import { GHO_ASSET_ID } from "@/utils"

export type ReserveLogoProps = AssetLogoProps & {
  address: string
}

export const ReserveLogo: React.FC<ReserveLogoProps> = ({
  address,
  ...props
}) => {
  const { currentMarketData } = useProtocolDataContext()

  const metadata = AssetMetadataFactory.getInstance()
  const isGho = stringEquals(
    currentMarketData.addresses.GHO_TOKEN_ADDRESS ?? "",
    address,
  )
  const assetId = isGho ? GHO_ASSET_ID : getAssetIdFromAddress(address)

  return (
    <AssetLogo
      src={metadata.getAssetLogoSrc(HYDRATION_PARACHAIN_ID, assetId)}
      {...props}
    />
  )
}
