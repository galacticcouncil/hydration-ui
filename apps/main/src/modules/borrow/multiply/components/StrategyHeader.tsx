import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { GHO_ASSET_ID, isGho } from "@galacticcouncil/money-market/utils"
import { Flex } from "@galacticcouncil/ui/components"
import {
  GDOT_ASSET_ID,
  GDOT_ERC20_ID,
  getAssetIdFromAddress,
  GETH_ASSET_ID,
  GETH_ERC20_ID,
} from "@galacticcouncil/utils"

import { AssetHeader } from "@/components/AssetHeader"
import { useAssets } from "@/providers/assetsProvider"

const RESERVE_LOGO_OVERRIDE_MAP: Record<string, string> = {
  [GDOT_ASSET_ID]: GDOT_ERC20_ID,
  [GETH_ASSET_ID]: GETH_ERC20_ID,
}

const getLogoId = (reserve: ComputedReserveData) => {
  if (isGho(reserve)) return GHO_ASSET_ID
  const assetId = getAssetIdFromAddress(reserve.underlyingAsset)
  return RESERVE_LOGO_OVERRIDE_MAP[assetId] ?? assetId
}

type StrategyHeaderProps = {
  collateralReserve: ComputedReserveData
  debtReserve: ComputedReserveData
}

export const StrategyHeader: React.FC<StrategyHeaderProps> = ({
  collateralReserve,
}) => {
  const { getAsset } = useAssets()

  const asset = getAsset(getLogoId(collateralReserve))

  if (!asset) return null

  return (
    <Flex align="center" gap="l">
      <AssetHeader asset={asset} />
    </Flex>
  )
}
