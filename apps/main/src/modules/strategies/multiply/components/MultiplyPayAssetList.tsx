import { useMemo } from "react"

import { AssetSelectModalContent } from "@/components/AssetSelectModal"
import { useAssetsToAddToMoneyMarket } from "@/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity.utils"
import {
  useAddableStablepoolTokens,
  useStablepoolReserves,
} from "@/modules/liquidity/Liquidity.utils"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"
import {
  withBalanceOrAll,
  withCollateralFirst,
} from "@/modules/strategies/multiply/utils/pay"
import { useAssets } from "@/providers/assetsProvider"

type MultiplyPayAssetListProps = {
  pair: MultiplyPair
  /** the pay asset in use, marked in the list */
  selectedAssetId: string
  onSelect: (payAssetId: string) => void
}

// fits ~9 rows; AssetSelectModalContent sizes its list from this
const LIST_HEIGHT = 560

/**
 * What the user can enter a pool-share loop with, ranked like the money-market
 * supply modal (collateral, the pool's reserves, their underlyings, then the
 * debt asset). Only held assets are listed, unless the user holds none.
 */
export const MultiplyPayAssetList: React.FC<MultiplyPayAssetListProps> = (
  props,
) => {
  const { pair } = props
  const { data: pool } = useStablepoolReserves(pair.collateralAssetId)
  const reserves = useAddableStablepoolTokens(
    pair.collateralAssetId,
    pool?.reserves ?? EMPTY,
  )
  const highPriorityAssetIds = useMemo(
    () => [pair.debtAssetId],
    [pair.debtAssetId],
  )
  const rankedAssets = useAssetsToAddToMoneyMarket({
    stableswapId: pair.collateralAssetId,
    reserves,
    options: { firstAssetId: pair.collateralAssetId, highPriorityAssetIds },
  })
  const { getAssetWithFallback } = useAssets()
  const sortedAssets = withBalanceOrAll(
    withCollateralFirst(
      rankedAssets,
      getAssetWithFallback(pair.collateralAssetId),
    ),
  )

  return <PayList {...props} sortedAssets={sortedAssets} />
}

// an empty `sortedAssets` falls back to every tradable asset, collateral first
const PayList: React.FC<
  MultiplyPayAssetListProps & {
    sortedAssets?: React.ComponentProps<
      typeof AssetSelectModalContent
    >["sortedAssets"]
  }
> = ({ pair, selectedAssetId, sortedAssets, onSelect }) => {
  const { tradable, getAssetWithFallback } = useAssets()
  const assets = useMemo(
    () =>
      withCollateralFirst(
        tradable,
        getAssetWithFallback(pair.collateralAssetId),
      ),
    [tradable, getAssetWithFallback, pair.collateralAssetId],
  )

  return (
    <AssetSelectModalContent
      assets={assets}
      sortedAssets={sortedAssets}
      selectedAssetId={selectedAssetId}
      searchInputVariant="standalone"
      flushTop
      height={LIST_HEIGHT}
      onSelect={(asset) => onSelect(asset.id)}
    />
  )
}

const EMPTY: never[] = []
