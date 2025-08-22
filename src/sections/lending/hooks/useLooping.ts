import { InterestRate, ProtocolAction } from "@aave/contract-helpers"

import { TradeConfigCursor } from "@galacticcouncil/apps"
import { Trade } from "@galacticcouncil/sdk"
import { useMutation, useQuery } from "@tanstack/react-query"
import { getMinAmountOut } from "api/trade"
import BigNumber from "bignumber.js"
import { PopulatedTransaction } from "ethers"
import i18n from "i18n/i18n"
import { TAsset, useAssets } from "providers/assets"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useRefetchMarketData } from "sections/lending/hooks/useRefetchMarketData"
import { useRootStore } from "sections/lending/store/root"
import { getLoopingSteps } from "sections/lending/utils/looping"
import { getReserveByAssetId } from "sections/lending/utils/utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useStore } from "state/store"
import { createToastMessages } from "state/toasts"
import { BN_0 } from "utils/constants"
import { H160 } from "utils/evm"
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
  assetInId: string
  assetOutId: string
  withEmode: boolean
}

type LoopingOptions = {
  onSubmitted?: () => void
  enabled: boolean
}

type LoopingStep = { supply: BigNumber; borrow: BigNumber }

export const useLooping = (
  {
    amount,
    multiplier,
    supplyAssetId,
    borrowAssetId,
    assetInId,
    assetOutId,
    withEmode,
  }: LoopingProps,
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
  const [borrow, estimateGasLimit, getPool, currentMarketData] = useRootStore(
    (state) => [
      state.borrow,
      state.estimateGasLimit,
      state.getCorrectPool,
      state.currentMarketData,
    ],
  )

  const assetIn = getAsset(assetInId)
  const assetOut = getAsset(assetOutId)

  const borrowReserve = getReserveByAssetId(reserves, borrowAssetId)
  const supplyReserve = getReserveByAssetId(reserves, supplyAssetId)

  const { data, isLoading: isLoadingBatch } = useQuery({
    enabled:
      options.enabled && !!borrowReserve && !!supplyReserve && !!assetOut,
    keepPreviousData: true,
    queryKey: QUERY_KEYS.moneyMarketLooping(
      assetInId,
      assetOutId,
      supplyAssetId,
      borrowAssetId,
      amount,
      multiplier,
      withEmode,
    ),
    queryFn: async () => {
      if (!account) throw new Error("Account not connected")
      if (!assetIn || !assetOut) throw new Error("Assets not found")
      if (!borrowReserve) throw new Error("Borrow reserve not found")
      if (!supplyReserve) throw new Error("Supply reserve not found")

      const { userEmodeCategoryId } = user
      const isInEmode = userEmodeCategoryId === supplyReserve.eModeCategoryId

      const loopingSteps = getLoopingSteps({
        initialAmount: amount,
        multiplier,
        ltv:
          isInEmode || withEmode
            ? supplyReserve.formattedEModeLtv
            : supplyReserve.formattedBaseLTVasCollateral,
      })

      const spotPrice = await sdk.api.router.getBestSpotPrice(
        assetInId,
        borrowAssetId,
      )

      const formattedSpotPrice = spotPrice
        ? spotPrice.amount.shiftedBy(-spotPrice.decimals).toString()
        : "1"

      const steps = loopingSteps.map((step) => ({
        borrow: step.borrow.times(formattedSpotPrice),
        supply: step.supply,
      }))

      printSteps(steps, borrowReserve, assetIn)

      const batch: BatchItem[] = []

      if (withEmode && !isInEmode) {
        const pool = getPool().getContractInstance(
          currentMarketData.addresses.LENDING_POOL,
        )
        const tx = await pool.populateTransaction.setUserEMode(
          supplyReserve.eModeCategoryId,
        )
        batch.push({
          type: "evm",
          data: {
            from: H160.fromSS58(account.address),
            ...(await estimateGasLimit(tx)),
          },
        })
      }

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
          batch.push({
            type: "evm",
            data: await estimateGasLimit(tx, ProtocolAction.borrow),
          })
        }

        if (supplyAmount.gt(0)) {
          const sell = await sdk.api.router.getBestSell(
            assetIn.id,
            assetOut.id,
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

  const { mutate: submitLooping, isLoading: isSubmitting } = useMutation(
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
              symbol: assetOut?.symbol,
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
    submitLooping,
    minAmountOut: data?.minAmountOut || "0",
  }
}

function printSteps(
  steps: LoopingStep[],
  borrowReserve: ComputedReserveData,
  assetIn: TAsset,
) {
  const stepsHumanized = steps.map((step) => ({
    borrow: i18n.t("value.tokenWithSymbol", {
      value: step.borrow,
      symbol: borrowReserve.symbol,
    }),
    supply: i18n.t("value.tokenWithSymbol", {
      value: step.supply,
      symbol: assetIn.symbol,
    }),
  }))

  console.table({
    ...Object.fromEntries(
      stepsHumanized.map((step, i) => [`Step ${i + 1}`, step]),
    ),
    [String.fromCharCode(160)]: {
      borrow: "👇",
      supply: "👇",
    },
    Total: {
      borrow: i18n.t("value.tokenWithSymbol", {
        value: steps.reduce((acc, curr) => acc.plus(curr.borrow), BN_0),
        symbol: borrowReserve.symbol,
      }),
      supply: i18n.t("value.tokenWithSymbol", {
        value: steps.reduce((acc, curr) => acc.plus(curr.supply), BN_0),
        symbol: assetIn.symbol,
      }),
    },
  })
}
