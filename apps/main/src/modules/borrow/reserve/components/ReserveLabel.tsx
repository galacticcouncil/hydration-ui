import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { GHO_ASSET_ID, isGho } from "@galacticcouncil/money-market/utils"
import { AssetLabel, AssetLogoProps } from "@galacticcouncil/ui/components"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"

import { AssetLabelFullContainer } from "@/components/AssetLabelFull"
import { ReserveLogo } from "@/modules/borrow/reserve/components/ReserveLogo"

export type ReserveLabelProps = {
  reserve: ComputedReserveData
  size?: AssetLogoProps["size"]
  withName?: boolean
}

export const ReserveLabel: React.FC<ReserveLabelProps> = ({
  reserve,
  size,
  withName = false,
}) => {
  const assetId = isGho(reserve)
    ? GHO_ASSET_ID
    : getAssetIdFromAddress(reserve.underlyingAsset)
  return (
    <AssetLabelFullContainer>
      <ReserveLogo id={assetId} size={size} />
      <AssetLabel
        size={size === "large" ? "large" : "medium"}
        name={withName ? reserve.name : undefined}
        symbol={reserve.symbol}
      />
    </AssetLabelFullContainer>
  )
}
