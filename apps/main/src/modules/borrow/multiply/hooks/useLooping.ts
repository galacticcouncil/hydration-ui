import { InterestRate } from "@aave/contract-helpers"
import { EModeCategory } from "@galacticcouncil/money-market/ui-config"
import { getReserveAddressByAssetId } from "@galacticcouncil/money-market/utils"
import {
  bigShift,
  MONEY_MARKET_STRATEGY_ASSETS,
  safeConvertAnyToH160,
  stringEquals,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"
import { unique } from "remeda"

import { useBorrowPoolBundleContract } from "@/api/borrow"
import {
  useBorrowReserves,
  useSetUsageAsCollateralTx,
  useSetUserEModeTx,
} from "@/api/borrow/queries"
import { evmGasPriceQuery } from "@/api/evm"
import { Trade } from "@/api/trade"
import { useCreateLoopingEvmTx } from "@/modules/borrow/hooks/useCreateLoopingEvmTx"
import {
  useLoopingSteps,
  UseLoopingStepsProps,
} from "@/modules/borrow/multiply/hooks/useLoopingSteps"
import { validateLoopingEvmTx } from "@/modules/borrow/multiply/utils/looping"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { AnyPapiTx } from "@/modules/transactions/types"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

type LoopingBatchItem =
  | { type: CallType.Substrate; data: Trade }
  | { type: CallType.Evm; data: AnyPapiTx }

export function useLooping({
  amount,
  multiplier,
  supplyAssetId,
  borrowAssetId,
  assetInId,
  assetOutId,
  isParityPair,
  eModeCategory,
}: UseLoopingStepsProps) {
  const { t } = useTranslation(["borrow"])
  const { account, isConnected } = useAccount()
  const rpc = useRpcProvider()
  const { data: reserves } = useBorrowReserves()
  const { getAsset } = useAssets()
  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)
  const poolBundleContract = useBorrowPoolBundleContract()

  const createBatchTx = useCreateBatchTx()
  const createEvmTx = useCreateLoopingEvmTx()
  const getSetUsageAsCollateralTx = useSetUsageAsCollateralTx()
  const getSetUserEModeTx = useSetUserEModeTx()

  const { sdk } = rpc

  const assetIn = getAsset(assetInId)
  const assetOut = getAsset(assetOutId)

  const supplyReserve = reserves?.formattedReserves.find((r) =>
    stringEquals(r.underlyingAsset, getReserveAddressByAssetId(supplyAssetId)),
  )
  const borrowReserve = reserves?.formattedReserves.find((r) =>
    stringEquals(r.underlyingAsset, getReserveAddressByAssetId(borrowAssetId)),
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

      const address = account.address

      const txs: AnyPapiTx[] = await Promise.all(
        batch.map(async (item) => {
          if (item.type === CallType.Substrate) {
            return sdk.tx
              .trade(item.data)
              .withSlippage(slippage)
              .withBeneficiary(address)
              .build()
              .then((tx) => tx.get())
          }
          return item.data
        }),
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

  const isLoading =
    isLoadingLoopingData || isLoadingBatch || isSubmitting || isLoadingGasPrice

  const batchErrors = batch
    ? batch.flatMap(({ data, type }) =>
        type === CallType.Substrate
          ? data.swaps.flatMap((swap) => swap.errors)
          : [],
      )
    : []

  const errors = unique(batchErrors)

  return {
    isLoading,
    submit,
    errors,
    ...loopingData,
  }
}
