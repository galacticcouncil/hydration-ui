import { InterestRate } from "@aave/contract-helpers"
import { getReserveAddressByAssetId } from "@galacticcouncil/money-market/utils"
import {
  bigShift,
  MAX_UINT256,
  safeConvertAnyToH160,
  stringEquals,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import Big from "big.js"

import {
  useBorrowPoolBundleContract,
  useBorrowPoolContract,
} from "@/api/borrow"
import { useBorrowReserves } from "@/api/borrow/queries"
import { evmGasPriceQuery } from "@/api/evm"
import { useCreateMultiplyEvmTx } from "@/modules/borrow/hooks/useCreateMultiplyEvmTx"
import {
  useUnloopingSteps,
  UseUnloopingStepsProps,
} from "@/modules/borrow/multiply/hooks/useUnloopingSteps"
import { BatchItem, validateEvmTx } from "@/modules/borrow/multiply/utils/batch"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

export function useUnloopingBatch(options: UseUnloopingStepsProps) {
  const { account, isConnected } = useAccount()
  const rpc = useRpcProvider()
  const { data: reserves } = useBorrowReserves()
  const { getAsset } = useAssets()
  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)
  const poolBundleContract = useBorrowPoolBundleContract()
  const poolContract = useBorrowPoolContract()

  const createEvmTx = useCreateMultiplyEvmTx()

  const { sdk } = rpc
  const {
    supplyAssetId,
    borrowAssetId,
    assetInId,
    assetOutId,
    enterWithAssetId,
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

  const { data: unloopingData, isLoading: isLoadingUnloopingData } =
    useUnloopingSteps(options)

  const { steps, isFullClose, finalSwapAmount } = unloopingData

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
      "unlooping",
      "batch",
      supplyAssetId,
      borrowAssetId,
      assetInId,
      assetOutId,
      enterWithAssetId,
      isFullClose,
      finalSwapAmount,
      slippage,
    ],
    queryFn: async () => {
      if (!account) throw new Error("Account not connected")
      if (!assetIn || !assetOut) throw new Error("Assets not found")
      if (!supplyReserve) throw new Error("Supply reserve not found")
      if (!borrowReserve) throw new Error("Borrow reserve not found")
      if (!gasPrice) throw new Error("Gas estimation failed")
      if (!poolBundleContract) throw new Error("Pool bundle contract not found")
      if (!poolContract) throw new Error("Pool contract not found")

      const evmAddress = safeConvertAnyToH160(account.address)

      const batch: BatchItem[] = []

      for (const [index, step] of steps.entries()) {
        const withdrawAmount = new Big(step.withdraw)

        // 1. Withdraw collateral
        const poolInstance = poolContract.getContractInstance(
          poolContract.poolAddress,
        )
        const withdrawTxRaw = await poolInstance.populateTransaction.withdraw(
          supplyReserve.underlyingAsset,
          bigShift(withdrawAmount, supplyReserve.decimals).toFixed(0),
          evmAddress,
        )
        const withdrawTx = {
          from: evmAddress,
          to: withdrawTxRaw.to,
          data: withdrawTxRaw.data,
        }
        validateEvmTx(withdrawTx)
        batch.push({ type: CallType.Evm, data: createEvmTx(withdrawTx) })

        // 2. Swap collateral -> borrow asset
        const sell = await sdk.api.router.getBestSell(
          Number(assetOutId),
          Number(assetInId),
          withdrawAmount.toString(),
        )
        batch.push({ type: CallType.Substrate, data: sell })

        // 3. Repay debt
        const isLastStep = index === steps.length - 1
        const repayThisStep = new Big(step.repay)
        const repayTx = poolBundleContract.repayTxBuilder.generateTxData({
          amount:
            isFullClose && isLastStep
              ? MAX_UINT256.toString()
              : bigShift(repayThisStep, borrowReserve.decimals).toFixed(0),
          reserve: borrowReserve.underlyingAsset,
          interestRateMode: InterestRate.Variable,
          user: evmAddress,
          useOptimizedPath: false,
        })
        validateEvmTx(repayTx)
        batch.push({ type: CallType.Evm, data: createEvmTx(repayTx) })
      }

      const needsFinalSwap =
        !!enterWithAssetId && enterWithAssetId !== supplyAssetId

      // If full close: append final withdraw for remaining collateral using MaxUint256
      if (isFullClose) {
        const poolInstance = poolContract.getContractInstance(
          poolContract.poolAddress,
        )
        const withdrawTxRaw = await poolInstance.populateTransaction.withdraw(
          supplyReserve.underlyingAsset,
          MAX_UINT256.toString(),
          evmAddress,
        )
        const withdrawTx = {
          from: evmAddress,
          to: withdrawTxRaw.to,
          data: withdrawTxRaw.data,
        }
        validateEvmTx(withdrawTx)
        batch.push({ type: CallType.Evm, data: createEvmTx(withdrawTx) })

        // Swap remaining collateral back to entry asset
        if (needsFinalSwap && new Big(finalSwapAmount).gt(0)) {
          const sell = await sdk.api.router.getBestSell(
            Number(supplyAssetId),
            Number(enterWithAssetId),
            finalSwapAmount,
          )
          batch.push({ type: CallType.Substrate, data: sell })
        }
      }

      // Partial repayment: swap excess collateral back to entry asset
      if (!isFullClose && needsFinalSwap && new Big(finalSwapAmount).gt(0)) {
        const sell = await sdk.api.router.getBestSell(
          Number(supplyAssetId),
          Number(enterWithAssetId),
          finalSwapAmount,
        )
        batch.push({ type: CallType.Substrate, data: sell })
      }

      return batch
    },
  })

  const isLoading =
    isLoadingUnloopingData || isLoadingBatch || isLoadingGasPrice

  return {
    batch,
    isLoading,
    ...unloopingData,
  }
}
