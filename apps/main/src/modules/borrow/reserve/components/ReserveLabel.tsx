import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { GHO_ASSET_ID, isGho } from "@galacticcouncil/money-market/utils"
import { AssetLabel, AssetLogoProps } from "@galacticcouncil/ui/components"
import {
  GDOT_ASSET_ID,
  GDOT_ERC20_ID,
  getAssetIdFromAddress,
  GETH_ASSET_ID,
  GETH_ERC20_ID,
} from "@galacticcouncil/utils"

import { AssetLabelFullContainer } from "@/components/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"

export type ReserveLabelProps = {
  reserve: ComputedReserveData
  size?: AssetLogoProps["size"]
  withName?: boolean
}

const RESERVE_LOGO_OVERRIDE_MAP: Record<string, string> = {
  [GDOT_ASSET_ID]: GDOT_ERC20_ID,
  [GETH_ASSET_ID]: GETH_ERC20_ID,
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
      <AssetLogo
        id={RESERVE_LOGO_OVERRIDE_MAP[assetId] ?? assetId}
        size={size}
      />
      <AssetLabel
        size={size === "large" ? "large" : "medium"}
        name={withName ? reserve.name : undefined}
        symbol={reserve.symbol}
      />
    </AssetLabelFullContainer>
  )
}
