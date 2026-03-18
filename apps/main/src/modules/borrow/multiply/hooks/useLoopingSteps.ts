import { EModeCategory } from "@galacticcouncil/money-market/ui-config"
import { getReserveAddressByAssetId } from "@galacticcouncil/money-market/utils"
import { stringEquals } from "@galacticcouncil/utils"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { last } from "remeda"

import { useBorrowReserves } from "@/api/borrow/queries"
import { PoolError } from "@/api/pools"
import { spotPriceQuery } from "@/api/spotPrice"
import { Trade } from "@/api/trade"
import { MultiplyLoopConfig } from "@/modules/borrow/multiply/types"
import { getReservePairLtv } from "@/modules/borrow/multiply/utils/leverage"
import {
  EPSILON,
  MAX_STEPS,
  printFormattedSteps,
} from "@/modules/borrow/multiply/utils/steps"
import { useAssets } from "@/providers/assetsProvider"
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
}

export function useLoopingSteps(options: UseLoopingStepsProps) {
  const {
    amount,
    multiplier,
    supplyAssetId,
    borrowAssetId,
    assetInId,
    assetOutId,
    isParityPair,
  } = options
  const rpc = useRpcProvider()
  const { data: reserves } = useBorrowReserves()
  const { getAsset } = useAssets()

  const supplyReserve = reserves?.formattedReserves.find((r) =>
    stringEquals(r.underlyingAsset, getReserveAddressByAssetId(supplyAssetId)),
  )

  const borrowReserve = reserves?.formattedReserves.find((r) =>
    stringEquals(r.underlyingAsset, getReserveAddressByAssetId(borrowAssetId)),
  )

  const assetOut = getAsset(assetOutId)
  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)

  const { data: spot } = useQuery(spotPriceQuery(rpc, assetInId, assetOutId))

  return useQuery({
    enabled:
      !!supplyReserve &&
      !!borrowReserve &&
      !!assetOut &&
      !!amount &&
      !!spot &&
      multiplier >= 1,
    initialData: INITIAL_DATA,
    placeholderData: keepPreviousData,
    queryKey: ["borrow", "looping", "steps", slippage, options],
    queryFn: async () => {
      const amountBig = new Big(amount || "0")

      if (
        amountBig.lte(0) ||
        !supplyReserve ||
        !borrowReserve ||
        !assetOut ||
        !spot?.spotPrice
      ) {
        return INITIAL_DATA
      }

      const ltv = getReservePairLtv(supplyReserve, borrowReserve)
      const ltvBig = new Big(ltv || "0")
      const slippageFactor = new Big(1).minus(new Big(slippage).div(100))

      const targetCollateral = amountBig.times(multiplier)
      const targetDebt = targetCollateral.minus(amountBig)

      const priceDivisor = isParityPair ? new Big(1) : new Big(spot.spotPrice)
      let collateral = amountBig
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
        const borrowInDebt = borrowAmount.div(priceDivisor).toString()
        const swap = borrowAmount.times(slippageFactor)

        collateral = collateral.plus(swap)
        debt = debt.plus(borrowAmount)

        const trade = await rpc.sdk.api.router.getBestSell(
          Number(assetInId),
          Number(assetOutId),
          borrowInDebt,
        )

        const swapErrors = trade.swaps.flatMap((swap) => swap.errors)

        result.push({
          step: i + 1,
          borrow: borrowInDebt,
          swap: swap.toString(),
          trade,
          swapErrors,
          collateralAfter: collateral.minus(amountBig).toString(),
          debtAfter: debt.div(priceDivisor).toString(),
        })
        i++
      }

      printFormattedSteps(result)

      const finalCollateral = last(result)?.collateralAfter
      const totalCollateral = finalCollateral
        ? new Big(finalCollateral).plus(amountBig)
        : amountBig

      return {
        steps: result,
        targetCollateral: targetCollateral.toString(),
        targetDebt: targetDebt.div(priceDivisor).toString(),
        totalCollateral: totalCollateral.toString(),
      }
    },
  })
}
