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
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { useBorrowPoolBundleContract } from "@/api/borrow"
import {
  useBorrowReserves,
  useSetUsageAsCollateralTx,
  useSetUserEModeTx,
} from "@/api/borrow/queries"
import { evmGasPriceQuery } from "@/api/evm"
import { useCreateLoopingEvmTx } from "@/modules/borrow/hooks/useCreateLoopingEvmTx"
import {
  useLoopingSteps,
  UseLoopingStepsProps,
} from "@/modules/borrow/multiply/hooks/useLoopingSteps"
import {
  LoopingBatchItem,
  validateLoopingEvmTx,
} from "@/modules/borrow/multiply/utils/looping"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

export function useLoopingBatch(options: UseLoopingStepsProps) {
  const { account, isConnected } = useAccount()
  const rpc = useRpcProvider()
  const { data: reserves } = useBorrowReserves()
  const { getAsset } = useAssets()
  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)
  const poolBundleContract = useBorrowPoolBundleContract()

  const createEvmTx = useCreateLoopingEvmTx()
  const getSetUsageAsCollateralTx = useSetUsageAsCollateralTx()
  const getSetUserEModeTx = useSetUserEModeTx()

  const { sdk } = rpc
  const {
    amount,
    multiplier,
    supplyAssetId,
    borrowAssetId,
    assetInId,
    assetOutId,
    eModeCategory,
  } = options

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
    useLoopingSteps(options)

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

  const isLoading = isLoadingLoopingData || isLoadingBatch || isLoadingGasPrice

  return {
    batch,
    isLoading,
    ...loopingData,
  }
}
