import { EModeCategory } from "@galacticcouncil/money-market/ui-config"
import { getReserveAddressByAssetId } from "@galacticcouncil/money-market/utils"
import { stringEquals } from "@galacticcouncil/utils"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { last } from "remeda"

import { useBorrowReserves } from "@/api/borrow/queries"
import { PoolError } from "@/api/pools"
import { Trade } from "@/api/trade"
import { useApyContext } from "@/modules/borrow/context/ApyContext"
import { MultiplyLoopConfig } from "@/modules/borrow/multiply/types"
import {
  getReservePairLiquidationLtv,
  getReservePairLtv,
} from "@/modules/borrow/multiply/utils/leverage"
import {
  EPSILON,
  MAX_STEPS,
  printFormattedSteps,
} from "@/modules/borrow/multiply/utils/steps"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

export type LoopStep = {
  step: number
  borrow: string
  swap: string
  collateralAfter: string
  debtAfter: string
  trade: Trade
  swapErrors: PoolError[]
}

export type UseLoopingStepsProps = MultiplyLoopConfig & {
  amount: string
  multiplier: number
  eModeCategory: EModeCategory
}

const INITIAL_DATA = {
  steps: [],
  totalCollateral: "0",
  targetCollateral: "0",
  targetDebt: "0",
  futureHF: "-1",
  netApy: "0",
}

export function useLoopingSteps(options: UseLoopingStepsProps) {
  const {
    amount,
    multiplier,
    supplyAssetId,
    borrowAssetId,
    assetInId,
    assetOutId,
  } = options
  const rpc = useRpcProvider()
  const { data: reserves } = useBorrowReserves()
  const { apyMap } = useApyContext()

  const supplyReserve = reserves?.formattedReserves.find((r) =>
    stringEquals(r.underlyingAsset, getReserveAddressByAssetId(supplyAssetId)),
  )

  const borrowReserve = reserves?.formattedReserves.find((r) =>
    stringEquals(r.underlyingAsset, getReserveAddressByAssetId(borrowAssetId)),
  )

  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)

  return useQuery({
    enabled: !!supplyReserve && !!borrowReserve && !!amount && multiplier >= 1,
    initialData: INITIAL_DATA,
    placeholderData: keepPreviousData,
    queryKey: ["borrow", "looping", "steps", slippage, options],
    queryFn: async () => {
      const amountBig = new Big(amount || "0")

      if (amountBig.lte(0) || !supplyReserve || !borrowReserve) {
        return INITIAL_DATA
      }

      const supplyOraclePrice = new Big(
        supplyReserve.formattedPriceInMarketReferenceCurrency,
      )
      const borrowOraclePrice = new Big(
        borrowReserve.formattedPriceInMarketReferenceCurrency,
      )

      const ltv = getReservePairLtv(supplyReserve, borrowReserve)
      const ltvBig = new Big(ltv || "0")
      const liquidationLtv = getReservePairLiquidationLtv(
        supplyReserve,
        borrowReserve,
      )
      const liquidationLtvBig = new Big(liquidationLtv || "0")
      const supplyExternalApy = apyMap.get(supplyAssetId)
      const borrowExternalApy = apyMap.get(borrowAssetId)
      const supplyApyBig = supplyExternalApy
        ? new Big(supplyExternalApy.totalSupplyApy).div(100)
        : new Big(supplyReserve.supplyAPY || "0")
      const borrowApyBig = borrowExternalApy
        ? new Big(borrowExternalApy.totalBorrowApy).div(100)
        : new Big(borrowReserve.variableBorrowAPY || "0")
      const slippageFactor = new Big(1).minus(new Big(slippage).div(100))

      const initialCollateral = amountBig.times(supplyOraclePrice)
      const targetCollateral = initialCollateral.times(multiplier)
      const targetDebt = targetCollateral.minus(initialCollateral)

      let collateral = initialCollateral
      let debt = new Big(0)
      const result: LoopStep[] = []
      let i = 0

      while (debt.lt(targetDebt.minus(EPSILON)) && i < MAX_STEPS) {
        const maxBorrow = collateral.times(ltvBig)
        const borrowCapacity = maxBorrow.minus(debt)
        const remaining = targetDebt.minus(debt)
        const borrowAmount = borrowCapacity.lt(remaining)
          ? borrowCapacity
          : remaining

        if (borrowAmount.lt(EPSILON)) break
        const borrowInDebt = borrowAmount.div(borrowOraclePrice)
        const swap = borrowAmount.times(slippageFactor)

        collateral = collateral.plus(swap)
        debt = debt.plus(borrowAmount)

        const trade = await rpc.sdk.api.router.getBestSell(
          Number(assetInId),
          Number(assetOutId),
          borrowInDebt.toString(),
        )

        const swapErrors = trade.swaps.flatMap((swap) => swap.errors)

        result.push({
          step: i + 1,
          borrow: borrowInDebt.toString(),
          swap: swap.div(supplyOraclePrice).toString(),
          trade,
          swapErrors,
          collateralAfter: collateral
            .minus(initialCollateral)
            .div(supplyOraclePrice)
            .toString(),
          debtAfter: debt.div(borrowOraclePrice).toString(),
        })
        i++
      }

      printFormattedSteps(
        result.map((step) => ({
          step: step.step,
          borrow: step.borrow,
          swap: step.swap,
          collateralAfter: step.collateralAfter,
          debtAfter: step.debtAfter,
        })),
      )

      const finalCollateral = last(result)?.collateralAfter
      const totalCollateral = finalCollateral
        ? new Big(finalCollateral).plus(amountBig)
        : amountBig
      const totalCollateralMarketReferenceCurrency =
        totalCollateral.times(supplyOraclePrice)
      const targetDebtShifted = targetDebt.div(borrowOraclePrice)
      const futureHF = targetDebt.lte(0)
        ? "-1"
        : totalCollateralMarketReferenceCurrency
            .times(liquidationLtvBig)
            .div(targetDebt)
            .toString()
      const netWorth = totalCollateralMarketReferenceCurrency.minus(targetDebt)
      const netApy = netWorth.lte(0)
        ? "0"
        : totalCollateralMarketReferenceCurrency
            .times(supplyApyBig)
            .minus(targetDebt.times(borrowApyBig))
            .div(netWorth)
            .toString()

      return {
        steps: result,
        targetCollateral: targetCollateral.div(supplyOraclePrice).toString(),
        targetDebt: targetDebtShifted.toString(),
        totalCollateral: totalCollateral.toString(),
        futureHF,
        netApy,
      }
    },
  })
}
