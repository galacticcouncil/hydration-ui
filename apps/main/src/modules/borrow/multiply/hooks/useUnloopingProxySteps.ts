import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { getReserveAssetIdByAddress } from "@galacticcouncil/money-market/utils"
import { PoolError } from "@galacticcouncil/sdk-next/pool"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { last } from "remeda"

import { Trade } from "@/api/trade"
import { getReservePairLtv } from "@/modules/borrow/multiply/utils/leverage"
import {
  EPSILON,
  MAX_STEPS,
  printFormattedSteps,
} from "@/modules/borrow/multiply/utils/steps"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

const INITIAL_DATA = {
  steps: [] as UnloopStep[],
  totalWithdrawn: "0",
  totalRepaid: "0",
  remainingCollateral: "0",
  remainingDebt: "0",
  isFullClose: false,
  finalSwapAmount: "0",
}

export type UnloopStep = {
  step: number
  withdraw: string
  swap: string
  repay: string
  collateralAfter: string
  debtAfter: string
  trade: Trade
  swapErrors: PoolError[]
}

type useUnloopingProxyStepsProps = {
  supplied: string
  borrowed: string
  repayAmount: string
  supplyReserve: ComputedReserveData
  borrowReserve: ComputedReserveData
  enterWithAssetId?: string
}

export function useUnloopingProxySteps({
  supplied,
  borrowed,
  repayAmount,
  supplyReserve,
  borrowReserve,
  enterWithAssetId,
}: useUnloopingProxyStepsProps) {
  const rpc = useRpcProvider()
  const { getRelatedAToken } = useAssets()

  const supplyAssetId = getReserveAssetIdByAddress(
    supplyReserve.underlyingAsset,
  )
  const borrowAssetId = getReserveAssetIdByAddress(
    borrowReserve.underlyingAsset,
  )

  const assetInId = borrowAssetId
  const collateralAsset = getRelatedAToken(supplyAssetId)

  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)

  return useQuery({
    enabled: !!repayAmount && !!collateralAsset,
    initialData: INITIAL_DATA,
    placeholderData: keepPreviousData,
    queryKey: [
      "borrow",
      "unloopingProxy",
      "steps",
      slippage,
      supplyAssetId,
      borrowAssetId,
      supplied,
      borrowed,
      repayAmount,
    ],
    queryFn: async () => {
      if (!collateralAsset) throw new Error("No collateralAsset found")

      const collateralBig = new Big(supplied || "0")
      const debtBig = new Big(borrowed || "0")
      const targetRepayBig = new Big(repayAmount || "0")

      if (
        targetRepayBig.lte(0) ||
        collateralBig.lte(0) ||
        debtBig.lte(0) ||
        !supplyReserve ||
        !borrowReserve
      ) {
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
      const slippageFactor = new Big(1).minus(new Big(slippage).div(100))

      const targetRepay = targetRepayBig.times(borrowOraclePrice)
      let collateral = collateralBig.times(supplyOraclePrice)
      let debt = debtBig.times(borrowOraclePrice)
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
        const withdraw = withdrawAmount.div(supplyOraclePrice).toString()

        collateral = collateral.minus(withdrawAmount)
        debt = debt.minus(repayThisStep)
        totalRepaid = totalRepaid.plus(repayThisStep)

        if (debt.lt(EPSILON)) {
          debt = new Big(0)
        }

        const trade = await rpc.sdk.api.router.getBestSell(
          Number(collateralAsset.id),
          Number(assetInId),
          withdraw,
        )

        const swapErrors = trade.swaps.flatMap((swap) => swap.errors)

        result.push({
          step: i + 1,
          withdraw,
          trade,
          swapErrors,
          swap: swapOutput.div(borrowOraclePrice).toString(),
          repay: repayThisStep.div(borrowOraclePrice).toString(),
          collateralAfter: collateral.div(supplyOraclePrice).toString(),
          debtAfter: debt.div(borrowOraclePrice).toString(),
        })
        i++
      }

      printFormattedSteps(
        result.map((step) => ({
          step: step.step,
          withdraw: step.withdraw,
          swap: step.swap,
          repay: step.repay,
          collateralAfter: step.collateralAfter,
          debtAfter: step.debtAfter,
        })),
      )

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
          const remainingAfterIterative = new Big(supplied).minus(
            totalWithdrawn,
          )
          finalSwapAmount = remainingAfterIterative.gt(0)
            ? remainingAfterIterative.toString()
            : "0"
        } else {
          const targetWithdrawNeeded = targetRepay
            .div(slippageFactor)
            .div(supplyOraclePrice)
          const excess = totalWithdrawn.minus(targetWithdrawNeeded)
          finalSwapAmount = excess.gt(0) ? excess.toString() : "0"
        }
      }

      return {
        steps: result,
        totalWithdrawn: isFullClose ? supplied : totalWithdrawn.toString(),
        totalRepaid: totalRepaid.div(borrowOraclePrice).toString(),
        remainingCollateral: isFullClose
          ? "0"
          : new Big(supplied).minus(totalWithdrawn).toString(),
        remainingDebt: isFullClose
          ? "0"
          : (lastStep?.debtAfter ?? debt.div(borrowOraclePrice).toString()),
        isFullClose,
        finalSwapAmount,
      }
    },
  })
}
