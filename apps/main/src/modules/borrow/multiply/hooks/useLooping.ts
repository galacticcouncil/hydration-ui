import { getReserveAddressByAssetId } from "@galacticcouncil/money-market/utils"
import { stringEquals } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { useBorrowReserves } from "@/api/borrow/queries"
import { useLoopingBatch } from "@/modules/borrow/multiply/hooks/useLoopingBatch"
import { UseLoopingStepsProps } from "@/modules/borrow/multiply/hooks/useLoopingSteps"
import {
  convertLoopingBatchToTxs,
  getLoopingBatchErrors,
} from "@/modules/borrow/multiply/utils/looping"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

export function useLooping(options: UseLoopingStepsProps) {
  const { t } = useTranslation(["borrow"])
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const { data: reserves } = useBorrowReserves()
  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)

  const createBatchTx = useCreateBatchTx()

  const { sdk } = rpc
  const { amount, supplyAssetId } = options

  const supplyReserve = reserves?.formattedReserves.find((r) =>
    stringEquals(r.underlyingAsset, getReserveAddressByAssetId(supplyAssetId)),
  )

  const { data: gasPrice, isLoading: isLoadingGasPrice } = useQuery(
    evmGasPriceQuery(rpc),
  )

  const { data: loopingData, isLoading: isLoadingLoopingData } =
    useLoopingSteps({
      amount,
      multiplier,
      supplyAssetId,
      borrowAssetId,
      assetInId,
      assetOutId,
      isParityPair,
      eModeCategory,
    })

  const { steps } = loopingData

  const { data: batch, isLoading: isLoadingBatch } = useQuery({
    enabled:
      isConnected &&
      steps.length > 0 &&
      !!supplyReserve &&
      !!borrowReserve &&
      !!assetIn &&
      !!assetOut &&
      !!gasPrice,
    placeholderData: keepPreviousData,
    queryKey: [
      "borrow",
      "looping",
      "batch",
      supplyAssetId,
      borrowAssetId,
      assetInId,
      assetOutId,
      amount,
      multiplier,
    ],
    queryFn: async () => {
      if (!account) throw new Error("Account not connected")
      if (!assetIn || !assetOut) throw new Error("Assets not found")
      if (!supplyReserve) throw new Error("Supply reserve not found")
      if (!borrowReserve) throw new Error("Borrow reserve not found")
      if (!gasPrice) throw new Error("Gas estimation failed")
      if (!poolBundleContract) throw new Error("Pool bundle contract not found")

      const evmAddress = safeConvertAnyToH160(account.address)
      const amountBig = new Big(amount || "0")

      const batch: LoopingBatchItem[] = []

      const isStrategyAsset =
        MONEY_MARKET_STRATEGY_ASSETS.includes(supplyAssetId)

      const slippageFactor = isStrategyAsset
        ? new Big(1).minus(new Big(slippage).div(100))
        : new Big(1)

      if (isStrategyAsset) {
        const sell = await sdk.api.router.getBestSell(
          Number(assetInId),
          Number(assetOutId),
          amountBig.toString(),
        )
        batch.push({ type: CallType.Substrate, data: sell })
      } else {
        const supplyTx = poolBundleContract.supplyTxBuilder.generateTxData({
          user: evmAddress,
          reserve: supplyReserve.underlyingAsset,
          amount: bigShift(amountBig, supplyReserve.decimals).toFixed(0),
          onBehalfOf: evmAddress,
          useOptimizedPath: false,
        })
        validateLoopingEvmTx(supplyTx, "supply")
        batch.push({ type: CallType.Evm, data: createEvmTx(supplyTx) })
      }

      if (eModeCategory !== EModeCategory.NONE) {
        const eModeTx = await getSetUserEModeTx(eModeCategory)
        batch.push({ type: CallType.Evm, data: eModeTx })
      }

      if (supplyReserve.isIsolated) {
        const enableCollateralTx = await getSetUsageAsCollateralTx(
          supplyReserve.underlyingAsset,
          true,
        )

        batch.push({
          type: CallType.Evm,
          data: enableCollateralTx,
        })
      }

      // For each step: borrow + swap
      for (const step of steps) {
        const borrowAmount = new Big(step.borrow)

        const borrowTx = poolBundleContract.borrowTxBuilder.generateTxData({
          amount: bigShift(borrowAmount, borrowReserve.decimals)
            .times(slippageFactor)
            .toFixed(0),
          reserve: borrowReserve.underlyingAsset,
          interestRateMode: InterestRate.Variable,
          debtTokenAddress: borrowReserve.variableDebtTokenAddress,
          user: evmAddress,
          useOptimizedPath: false,
        })
        validateLoopingEvmTx(borrowTx, "borrow")
        batch.push({ type: CallType.Evm, data: createEvmTx(borrowTx) })

        // Swap borrowed asset -> supply aToken
        const sell = await sdk.api.router.getBestSell(
          Number(assetInId),
          Number(assetOutId),
          borrowAmount.toString(),
        )
        batch.push({ type: CallType.Substrate, data: sell })
      }

      return batch
    },
  })

  const { mutate: submit, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (!batch?.length) throw new Error("Invalid looping batch")
      if (!account) throw new Error("Account not connected")
      if (!supplyReserve) throw new Error("Supply reserve not found")

      const txs = await convertLoopingBatchToTxs(
        sdk,
        batch,
        account.address,
        slippage,
      )

      return createBatchTx({
        txs,
        transaction: {
          toasts: {
            submitted: t("multiply.toast.onLoading", {
              symbol: supplyReserve.symbol,
              value: amount,
            }),
            success: t("multiply.toast.onSuccess", {
              symbol: supplyReserve.symbol,
              value: amount,
            }),
          },
        },
      })
    },
  })

  const isLoading = isLoadingBatch || isSubmitting

  const errors = batch ? getLoopingBatchErrors(batch) : []

  return {
    targetCollateral,
    targetDebt,
    totalCollateral,
    isLoading,
    submit,
    errors,
  }
}
