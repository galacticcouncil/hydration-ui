import { getReserveAddressByAssetId } from "@galacticcouncil/money-market/utils"
import { stringEquals } from "@galacticcouncil/utils"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { last } from "remeda"

import { useBorrowReserves } from "@/api/borrow/queries"
import { spotPriceQuery } from "@/api/spotPrice"
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

export type UnloopStep = {
  step: number
  withdraw: string
  swap: string
  repay: string
  collateralAfter: string
  debtAfter: string
}

export type UseUnloopingStepsProps = MultiplyLoopConfig & {
  currentCollateral: string
  currentDebt: string
  repayAmount: string
}

const INITIAL_DATA = {
  steps: [] as UnloopStep[],
  totalWithdrawn: "0",
  totalRepaid: "0",
  remainingCollateral: "0",
  remainingDebt: "0",
  isFullClose: false,
  finalSwapAmount: "0",
}

export function useUnloopingSteps(options: UseUnloopingStepsProps) {
  const rpc = useRpcProvider()
  const { data: reserves } = useBorrowReserves()
  const { getAsset } = useAssets()

  const {
    currentCollateral,
    currentDebt,
    repayAmount,
    supplyAssetId,
    borrowAssetId,
    assetInId,
    assetOutId,
    isParityPair,
    enterWithAssetId,
  } = options

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
      !!repayAmount &&
      !!spot,
    initialData: INITIAL_DATA,
    placeholderData: keepPreviousData,
    queryKey: ["borrow", "unlooping", "steps", slippage, options],
    queryFn: async () => {
      const collateralBig = new Big(currentCollateral || "0")
      const debtBig = new Big(currentDebt || "0")
      const targetRepay = new Big(repayAmount || "0")

      if (
        targetRepay.lte(0) ||
        collateralBig.lte(0) ||
        debtBig.lte(0) ||
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

      const priceDivisor = isParityPair ? new Big(1) : new Big(spot.spotPrice)
      let collateral = collateralBig
      let debt = debtBig
      let totalRepaid = new Big(0)
      const result: UnloopStep[] = []
      let i = 0

      while (
        totalRepaid.lt(targetRepay.minus(EPSILON)) &&
        debt.gt(EPSILON) &&
        i < MAX_STEPS
      ) {
        const safeCollateral = debt.div(ltvBig)
        const maxWithdraw = collateral.minus(safeCollateral).times(0.95)

        if (maxWithdraw.lt(EPSILON)) break

        const remaining = targetRepay.minus(totalRepaid)
        const amountNeededToWithdraw = remaining.div(slippageFactor)
        const withdrawAmount = maxWithdraw.lt(amountNeededToWithdraw)
          ? maxWithdraw
          : amountNeededToWithdraw

        if (withdrawAmount.lt(EPSILON)) break

        const swapOutput = withdrawAmount.times(slippageFactor)
        const repayThisStep = swapOutput

        collateral = collateral.minus(withdrawAmount)
        debt = debt.minus(repayThisStep)
        totalRepaid = totalRepaid.plus(repayThisStep)

        if (debt.lt(EPSILON)) {
          debt = new Big(0)
        }

        result.push({
          step: i + 1,
          withdraw: withdrawAmount.div(priceDivisor).toString(),
          swap: swapOutput.toString(),
          repay: repayThisStep.div(priceDivisor).toString(),
          collateralAfter: collateral.toString(),
          debtAfter: debt.div(priceDivisor).toString(),
        })
        i++
      }

      printFormattedSteps(result)

      const lastStep = last(result)
      const isFullClose = new Big(repayAmount || "0").gte(debtBig)

      const totalWithdrawn = result.reduce(
        (sum, s) => sum.plus(s.withdraw),
        new Big(0),
      )

      const needsFinalSwap =
        !!enterWithAssetId && enterWithAssetId !== supplyAssetId

      let finalSwapAmount = "0"
      if (needsFinalSwap) {
        if (isFullClose) {
          const remainingAfterIterative = new Big(currentCollateral).minus(
            totalWithdrawn,
          )
          finalSwapAmount = remainingAfterIterative.gt(0)
            ? remainingAfterIterative.toString()
            : "0"
        } else {
          const targetWithdrawNeeded = targetRepay.div(slippageFactor)
          const excess = totalWithdrawn.minus(targetWithdrawNeeded)
          finalSwapAmount = excess.gt(0) ? excess.toString() : "0"
        }
      }

      return {
        steps: result,
        totalWithdrawn: isFullClose
          ? currentCollateral
          : totalWithdrawn.toString(),
        totalRepaid: totalRepaid.toString(),
        remainingCollateral: isFullClose
          ? "0"
          : new Big(currentCollateral).minus(totalWithdrawn).toString(),
        remainingDebt: isFullClose
          ? "0"
          : (lastStep?.debtAfter ?? debt.div(priceDivisor).toString()),
        isFullClose,
        finalSwapAmount,
      }
    },
  })
}
