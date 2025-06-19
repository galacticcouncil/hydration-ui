import { InterestRate } from "@aave/contract-helpers"

import { TradeConfigCursor } from "@galacticcouncil/apps"
import { Trade } from "@galacticcouncil/sdk"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import { PopulatedTransaction } from "ethers"
import { useAssets } from "providers/assets"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import { useBackgroundDataProvider } from "sections/lending/hooks/app-data-provider/BackgroundDataProvider"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useRootStore } from "sections/lending/store/root"
import { queryKeysFactory } from "sections/lending/ui-config/queries"
import { getReserveByAssetId } from "sections/lending/utils/utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useStore } from "state/store"
import { createToastMessages } from "state/toasts"
import { QUERY_KEYS } from "utils/queryKeys"

type BatchItem =
  | {
      type: "trade"
      data: Trade
    }
  | {
      type: "evm"
      data: PopulatedTransaction
    }

type LoopingProps = {
  amount: string
  multiplier: number
  borrowAssetId: string
  supplyAssetId: string
  aTokenId: string
}

type LoopingOptions = {
  onSubmitted?: () => void
  enabled: boolean
}

export const useLooping = (
  { amount, multiplier, supplyAssetId, borrowAssetId, aTokenId }: LoopingProps,
  options: LoopingOptions,
) => {
  const { t } = useTranslation()
  const { createTransaction } = useStore()
  const { account } = useAccount()
  const { api, sdk } = useRpcProvider()
  const { reserves } = useAppDataContext()
  const { getAsset } = useAssets()
  const [borrow, estimateGasLimit] = useRootStore((state) => [
    state.borrow,
    state.estimateGasLimit,
  ])
  const queryClient = useQueryClient()
  const { refetchPoolData, refetchIncentiveData, refetchGhoData } =
    useBackgroundDataProvider()

  const borrowReserve = getReserveByAssetId(reserves, borrowAssetId)
  const supplyReserve = getReserveByAssetId(reserves, supplyAssetId)
  const aToken = getAsset(aTokenId)

  const { data: batch, isLoading: isLoadingBatch } = useQuery({
    enabled: options.enabled && !!borrowReserve && !!supplyReserve && !!aToken,
    queryKey: QUERY_KEYS.moneyMarketLooping(amount, multiplier),
    queryFn: async () => {
      if (!borrowReserve) throw new Error("Borrow reserve not found")
      if (!supplyReserve) throw new Error("Supply reserve not found")
      if (!aToken) throw new Error("aToken not found")

      const steps = getLoopingSteps({
        initialAmount: BigNumber(amount).toNumber(),
        loops: multiplier,
        ltv: Number(supplyReserve.formattedEModeLtv),
      })

      const txs: BatchItem[] = []

      for (const [index, amount] of steps.entries()) {
        // Skip borrowing on first step
        if (index !== 0) {
          const tx = borrow({
            amount: BigNumber(amount)
              .shiftedBy(borrowReserve.decimals)
              .multipliedBy(0.99)
              .toFixed(0),
            reserve: borrowReserve.underlyingAsset,
            interestRateMode: InterestRate.Variable,
            debtTokenAddress: borrowReserve.variableDebtTokenAddress,
          })
          const data = await estimateGasLimit(tx)
          txs.push({
            type: "evm",
            data,
          })
        }

        const sell = await sdk.api.router.getBestSell(
          borrowAssetId,
          aToken.id,
          amount,
        )
        txs.push({
          type: "trade",
          data: sell,
        })
      }

      return txs
    },
  })

  const { mutate: submitLooping, isLoading: isSubmitting } = useMutation(
    async () => {
      if (!batch || !account) return

      const extrinsicBatch = batch.map(async (item) => {
        if (item.type === "trade") {
          const slippageData = TradeConfigCursor.deref().slippage ?? "0"
          const tx = await sdk.tx
            .trade(item.data)
            .withSlippage(Number(slippageData))
            .withBeneficiary(account.address)
            .build()
          if (!tx) throw new Error("Failed to build trade transaction")
          return api.tx(tx.hex)
        }

        return api.tx.evm.call(
          item.data.from ?? "",
          item.data.to ?? "",
          item.data.data ?? "",
          "0",
          item.data.gasLimit?.toString() ?? "0",
          item.data.maxFeePerGas?.toString() ?? "0",
          item.data.maxPriorityFeePerGas?.toString() ?? "0",
          null,
          [],
        )
      })

      const extrinsics = await Promise.all(extrinsicBatch)

      return createTransaction(
        {
          tx: api.tx.utility.batchAll(extrinsics),
        },
        {
          toast: createToastMessages("lending.looping.toast", {
            t,
            tOptions: {
              symbol: aToken?.symbol,
              value: amount,
            },
            components: ["span.highlight"],
          }),
          rejectOnClose: true,
          onSubmitted: options.onSubmitted,
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool })
            refetchPoolData?.()
            refetchIncentiveData?.()
            refetchGhoData?.()
          },
        },
      )
    },
  )

  const isLoading = isLoadingBatch || isSubmitting

  return {
    isLoading,
    submitLooping,
  }
}

function getLoopingSteps({
  initialAmount,
  ltv,
  loops,
}: {
  initialAmount: number
  loops: number
  ltv: number
}): number[] {
  return Array.from({ length: loops }).reduce<number[]>(
    (acc) => {
      const prev = acc[acc.length - 1]
      const next = prev * ltv
      return [...acc, next]
    },
    [initialAmount],
  )
}
