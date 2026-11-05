import {
  useHollarFacilitator,
  useMoneyMarket,
  useReserveSummaries,
} from "@galacticcouncil/money-market/react"
import { type ReserveSummary } from "@galacticcouncil/money-market/types"
import Big from "big.js"

import { useResolveReserveApy } from "@/modules/money-market/apy/ReserveApyProvider"
import { isHollar } from "@/modules/money-market/reserves/reserves"
import {
  MULTIPLY_PAIRS,
  type MultiplyPair,
} from "@/modules/strategies/multiply/config/pairs"
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
  ReturnType<typeof useMultiplyPairsMetrics>[number]["data"]
>

// Reserve-derived figures for every pair, in config order. Needs a
// ReserveApyProvider above it.
export const useMultiplyPairsMetrics = () => {
  const { data: reserves, isPending } = useReserveSummaries()
  const resolveApy = useResolveReserveApy()
  const { market } = useMoneyMarket()
  const facilitator = useHollarFacilitator()

  const findReserve = (address: string) =>
    reserves?.find(
      (r) => r.underlyingAsset.toLowerCase() === address.toLowerCase(),
    )

  return MULTIPLY_PAIRS.map((pair) => {
    const collateralReserve = findReserve(pair.collateral)
    const debtReserve = findReserve(pair.debt)
    const supplyRate = collateralReserve
      ? resolveApy(collateralReserve).supply
      : undefined
    const borrowRate = debtReserve ? resolveApy(debtReserve).borrow : undefined
    const supplyApy = knownRate(supplyRate)
    const borrowApy = knownRate(borrowRate)

    return {
      pair,
      data:
        collateralReserve && debtReserve
          ? getPairMetrics({
              pair,
              collateralReserve,
              debtReserve,
              supplyApy,
              borrowApy,
              hollarRoom: isHollar(debtReserve.underlyingAsset, market)
                ? facilitator.data
                  ? Big.max(
                      Big(facilitator.data.maxCapacity).minus(
                        facilitator.data.level,
                      ),
                      0,
                    ).toString()
                  : null
                : undefined,
            })
          : null,
      collateralReserve,
      debtReserve,
      isLoading:
        isPending ||
        supplyRate?.status === "loading" ||
        borrowRate?.status === "loading",
    }
  })
}

const getPairMetrics = ({
  pair,
  collateralReserve,
  debtReserve,
  supplyApy,
  borrowApy,
  hollarRoom,
}: {
  pair: MultiplyPair
  collateralReserve: ReserveSummary
  debtReserve: ReserveSummary
  supplyApy: number | null
  borrowApy: number | null
  // Hollar is minted, so its room is the facilitator bucket, not the
  // reserve's liquidity (same rule as the borrow dashboard); undefined when
  // the debt is not Hollar
  hollarRoom: string | null | undefined
}) => {
  // the position contract enters pair.eMode, so the category's figures apply
  const inEMode =
    pair.eMode !== 0 && collateralReserve.eModeCategoryId === pair.eMode
  const lt = Number(
    inEMode
      ? collateralReserve.eModeLiquidationThreshold
      : collateralReserve.liquidationThreshold,
  )
  const ltv = Number(
    inEMode ? collateralReserve.eModeLtv : collateralReserve.ltv,
  )
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
    availableLiquidity:
      hollarRoom !== undefined ? hollarRoom : debtReserve.availableLiquidity,
    unavailableReason:
      maxLeverage > 1
        ? getMultiplyUnavailableReason(collateralReserve, debtReserve)
        : ("notBorrowable" as const),
  }
}
