import { InterestRate } from "@aave/contract-helpers"

import { TradeConfigCursor } from "@galacticcouncil/apps"
import { Trade } from "@galacticcouncil/sdk"
import { useMutation, useQuery } from "@tanstack/react-query"
import { getMinAmountOut } from "api/trade"
import BigNumber from "bignumber.js"
import { PopulatedTransaction } from "ethers"
import { useAssets } from "providers/assets"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useRefetchMarketData } from "sections/lending/hooks/useRefetchMarketData"
import { useRootStore } from "sections/lending/store/root"
import { getReserveByAssetId } from "sections/lending/utils/utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useStore } from "state/store"
import { createToastMessages } from "state/toasts"
import { BN_0 } from "utils/constants"
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

type LoopingStep = { supply: BigNumber; borrow: BigNumber }

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
  const { user } = useAppDataContext()
  const refetchMarketData = useRefetchMarketData()
  const [borrow, estimateGasLimit] = useRootStore((state) => [
    state.borrow,
    state.estimateGasLimit,
  ])

  const borrowReserve = getReserveByAssetId(reserves, borrowAssetId)
  const supplyReserve = getReserveByAssetId(reserves, supplyAssetId)
  const aToken = getAsset(aTokenId)

  const { data, isLoading: isLoadingBatch } = useQuery({
    enabled: options.enabled && !!borrowReserve && !!supplyReserve && !!aToken,
    keepPreviousData: true,
    queryKey: QUERY_KEYS.moneyMarketLooping(amount, multiplier),
    queryFn: async () => {
      if (!borrowReserve) throw new Error("Borrow reserve not found")
      if (!supplyReserve) throw new Error("Supply reserve not found")
      if (!aToken) throw new Error("aToken not found")

      const { userEmodeCategoryId } = user

      const isInEmode = supplyReserve.eModeCategoryId === userEmodeCategoryId

      const steps = getLoopingSteps({
        initialAmount: amount,
        multiplier,
        ltv: isInEmode
          ? supplyReserve.formattedEModeLtv
          : supplyReserve.formattedBaseLTVasCollateral,
      })

      const stepsHumanizted = steps.map((step) => ({
        borrow: step.borrow.toNumber(),
        supply: step.supply.toNumber(),
      }))

      console.table({
        ...Object.fromEntries(
          stepsHumanizted.map((user, i) => [
            `Step ${i + 1}${i === 3 ? " (Target supply adjustment)" : ""}${i === 4 ? " (Squeeze HF)" : ""}`,
            user,
          ]),
        ),
        [String.fromCharCode(160)]: {
          borrow: "👇",
          supply: "👇",
        },
        Total: {
          borrow: steps
            .reduce((acc, curr) => acc.plus(curr.borrow), BN_0)
            .toNumber(),
          supply: steps
            .reduce((acc, curr) => acc.plus(curr.supply), BN_0)
            .toNumber(),
        },
      })

      const batch: BatchItem[] = []

      for (const step of steps) {
        const { supply: supplyAmount, borrow: borrowAmount } = step

        if (borrowAmount.gt(0)) {
          const tx = borrow({
            amount: BigNumber(borrowAmount)
              .shiftedBy(borrowReserve.decimals)
              .multipliedBy(0.99)
              .toFixed(0),
            reserve: borrowReserve.underlyingAsset,
            interestRateMode: InterestRate.Variable,
            debtTokenAddress: borrowReserve.variableDebtTokenAddress,
          })
          const data = await estimateGasLimit(tx)
          batch.push({
            type: "evm",
            data,
          })
        }

        if (supplyAmount.gt(0)) {
          const sell = await sdk.api.router.getBestSell(
            borrowAssetId,
            aToken.id,
            supplyAmount,
          )
          batch.push({
            type: "trade",
            data: sell,
          })
        }
      }

      const amountOut = batch.reduce((acc, curr) => {
        if (curr.type === "trade") {
          return acc.plus(curr.data.amountOut)
        }
        return acc
      }, BN_0)

      const minAmountOut = getMinAmountOut(
        amountOut.toString(),
        TradeConfigCursor.deref().slippage ?? "0",
      )

      return { batch, minAmountOut }
    },
  })

  const { mutate: createLoopingTx, isLoading: isSubmitting } = useMutation(
    async () => {
      if (!data || !account) return

      const { batch } = data

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
          onSuccess: refetchMarketData,
        },
      )
    },
  )

  const isLoading = isLoadingBatch || isSubmitting

  return {
    isLoading,
    createLoopingTx,
    minAmountOut: data?.minAmountOut || "0",
  }
}

function getLoopingSteps({
  initialAmount,
  multiplier,
  ltv,
}: {
  initialAmount: string
  multiplier: number
  ltv: string
}): LoopingStep[] {
  const amount = new BigNumber(initialAmount)

  const steps = Array.from({ length: multiplier - 1 }).reduce<LoopingStep[]>(
    (acc) => {
      const prev = acc[acc.length - 1]
      const supply = prev.supply.times(ltv)
      const borrow = supply
      return [...acc, { supply, borrow }]
    },
    [{ supply: amount, borrow: new BigNumber(0) }],
  )

  const targetTotalSupply = amount.times(multiplier)
  const accumulatedSupply = steps.reduce(
    (sum, step) => sum.plus(step.supply),
    new BigNumber(0),
  )

  // adjustment to reach the target total supply
  const adjustmentStep: LoopingStep = {
    supply: targetTotalSupply.minus(accumulatedSupply),
    borrow: steps[steps.length - 1].supply.times(ltv),
  }

  // final step to squeeze Health Factor with some safety margin
  const squeezeStep: LoopingStep = {
    supply: BN_0,
    borrow: adjustmentStep.supply.times(ltv).times(0.9),
  }

  return [...steps, adjustmentStep, squeezeStep]
}
