import {
  ComputedReserveData,
  useMarketAssetsData,
} from "@galacticcouncil/money-market/hooks"
import { getReserveAddressByAssetId } from "@galacticcouncil/money-market/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"

import { BorrowAssetApyData } from "@/api/borrow"
import { useApyContext } from "@/modules/borrow/context/ApyContext"
import { MultiplyAssetPairConfig } from "@/modules/borrow/multiply/types"
import { useAssets } from "@/providers/assetsProvider"

export type MultiplyPairDetailData = {
  collateralReserve: ComputedReserveData
  debtReserve: ComputedReserveData
  apyData: BorrowAssetApyData | undefined
}

export function useMultiplyPairDetailData(
  config: MultiplyAssetPairConfig | undefined,
): MultiplyPairDetailData | null {
  const { getAsset } = useAssets()
  const { data: reserves } = useMarketAssetsData()
  const { apyMap } = useApyContext()

  if (!config) return null

  const collateralReserve = reserves.find(
    (r) =>
      getAssetIdFromAddress(r.underlyingAsset) === config.collateralAssetId,
  )

  const borrowAssetId = config.debtAssetId
  const borrowAsset = getAsset(borrowAssetId)

  const debtReserve = borrowAsset
    ? reserves.find(
        (r) => r.underlyingAsset === getReserveAddressByAssetId(borrowAsset.id),
      )
    : undefined

  if (!collateralReserve || !debtReserve) return null

  const apyData = apyMap.get(config.collateralAssetId)

  return {
    collateralReserve,
    debtReserve,
    apyData,
  }
}
