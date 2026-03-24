import { getReserveAddressByAssetId } from "@galacticcouncil/money-market/utils"
import { stringEquals } from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"

import { useUserBorrowSummary } from "@/api/borrow"
import { LEVERAGE_MIN } from "@/modules/borrow/multiply/config/constants"
import { MULTIPLY_ASSETS_CONFIG } from "@/modules/borrow/multiply/config/pairs"
import type { MultiplyPositionRow } from "@/modules/borrow/multiply/MultiplyPositionsTable.columns"
import { calculateEffectiveLeverage } from "@/modules/borrow/multiply/utils/leverage"

const isValidMultiplyPosition = (row: MultiplyPositionRow) =>
  Big(row.collateralAmount || "0").gt(0) &&
  Big(row.debtAmount || "0").gt(0) &&
  Big(row.effectiveLeverage || "0").gte(LEVERAGE_MIN)

export function useMultiplyPositionsData(): MultiplyPositionRow[] {
  const { data: user } = useUserBorrowSummary()

  return useMemo(() => {
    return MULTIPLY_ASSETS_CONFIG.map((pair) => {
      const collateralAddress = getReserveAddressByAssetId(
        pair.collateralAssetId,
      )
      const debtAddress = getReserveAddressByAssetId(pair.debtAssetId)

      const collateralReserve = user?.userReservesData.find((r) =>
        stringEquals(r.reserve.underlyingAsset, collateralAddress),
      )
      const debtReserve = user?.userReservesData.find((r) =>
        stringEquals(r.reserve.underlyingAsset, debtAddress),
      )

      const collateralAmount = collateralReserve?.underlyingBalance ?? "0"
      const debtAmount = debtReserve?.variableBorrows ?? "0"

      const effectiveLeverage = calculateEffectiveLeverage(
        collateralAmount,
        debtAmount,
      )

      return {
        id: pair.id,
        pair,
        collateralAmount,
        debtAmount,
        effectiveLeverage,
      }
    }).filter(isValidMultiplyPosition)
  }, [user?.userReservesData])
}
