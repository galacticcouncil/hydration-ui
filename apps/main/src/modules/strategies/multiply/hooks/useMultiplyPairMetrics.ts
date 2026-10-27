import { useReserveSummaries } from "@galacticcouncil/money-market/react"
import { useMemo } from "react"

import { useResolveReserveApy } from "@/modules/money-market/apy/ReserveApyProvider"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"
import { getMultiplyUnavailableReason } from "@/modules/strategies/multiply/utils/availability"
import {
  getMaxLeverage,
  getSliderMaxLeverage,
  projectMultiplyPosition,
} from "@/modules/strategies/multiply/utils/projection"

const WAD = 1e18

const knownRate = (rate: { status: string; total?: string } | undefined) =>
  rate?.status === "known" && rate.total !== undefined
    ? Number(rate.total)
    : null

export type MultiplyPairMetrics = NonNullable<
  ReturnType<typeof useMultiplyPairMetrics>["data"]
>

// Reserve-derived figures for one pair. Needs a ReserveApyProvider above it.
export const useMultiplyPairMetrics = (pair: MultiplyPair) => {
  const { data: reserves, isPending } = useReserveSummaries()
  const resolveApy = useResolveReserveApy()

  const collateralReserve = reserves?.find(
    (r) => r.underlyingAsset.toLowerCase() === pair.collateral.toLowerCase(),
  )
  const debtReserve = reserves?.find(
    (r) => r.underlyingAsset.toLowerCase() === pair.debt.toLowerCase(),
  )

  const supplyRate = collateralReserve
    ? resolveApy(collateralReserve).supply
    : undefined
  const borrowRate = debtReserve ? resolveApy(debtReserve).borrow : undefined
  const supplyApy = knownRate(supplyRate)
  const borrowApy = knownRate(borrowRate)

  const metrics = useMemo(() => {
    if (!collateralReserve || !debtReserve) return null

    const lt = Number(collateralReserve.liquidationThreshold)
    const ltv = Number(collateralReserve.ltv)
    const minHf = Number(pair.minHf) / WAD
    const maxLeverage = getSliderMaxLeverage(getMaxLeverage({ lt, ltv, minHf }))

    const maxNetApy =
      supplyApy !== null && borrowApy !== null && maxLeverage > 1
        ? projectMultiplyPosition({
            amount: 1,
            collateralPriceUsd: Number(collateralReserve.priceInUsd),
            debtPriceUsd: Number(debtReserve.priceInUsd),
            leverage: maxLeverage,
            lt,
            minHf,
            supplyApy,
            borrowApy,
          }).netApy
        : null

    return {
      lt,
      ltv,
      minHf,
      maxLeverage,
      supplyApy,
      borrowApy,
      maxNetApy,
      unavailableReason:
        maxLeverage > 1
          ? getMultiplyUnavailableReason(collateralReserve, debtReserve)
          : "notBorrowable",
    }
  }, [collateralReserve, debtReserve, pair.minHf, supplyApy, borrowApy])

  return {
    data: metrics,
    collateralReserve,
    debtReserve,
    isLoading:
      isPending ||
      supplyRate?.status === "loading" ||
      borrowRate?.status === "loading",
  }
}
