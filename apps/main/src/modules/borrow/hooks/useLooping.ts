import {
  InterestRate,
  Pool,
  PoolBundle,
  ProtocolAction,
} from "@aave/contract-helpers"
import { Web3Provider } from "@ethersproject/providers"
import { h160 } from "@galacticcouncil/common"
import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import {
  getLoopingSteps,
  LoopingStep,
} from "@galacticcouncil/money-market/libs/looping"
import {
  AaveV3HydrationMainnet,
  gasLimitRecommendations,
} from "@galacticcouncil/money-market/ui-config"
import { getReserveAddressByAssetId } from "@galacticcouncil/money-market/utils"
import { bigShift, formatCurrency, stringEquals } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import Big from "big.js"
import { Binary } from "polkadot-api"
import { useTranslation } from "react-i18next"

import { useBorrowReserves, useUserBorrowSummary } from "@/api/borrow/queries"
import { Trade } from "@/api/trade"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { AnyPapiTx } from "@/modules/transactions/types"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

const { H160 } = h160

type BatchItem =
  | { type: "trade"; data: Trade }
  | { type: "evm"; data: AnyPapiTx }

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
  const { t } = useTranslation(["borrow"])
  const { account } = useAccount()
  const { papi, sdk, evm } = useRpcProvider()
  const { data: reserves } = useBorrowReserves()
  const { data: user } = useUserBorrowSummary()
  const { getAsset } = useAssets()
  const queryClient = useQueryClient()
  const createBatchTx = useCreateBatchTx()
  const slippage = useTradeSettings((s) => s.swap.single.swapSlippage)

  const assetIn = getAsset(assetInId)
  const assetOut = getAsset(assetOutId)

  const borrowReserve = reserves?.formattedReserves.find((r) =>
    stringEquals(r.underlyingAsset, getReserveAddressByAssetId(borrowAssetId)),
  )
  const supplyReserve = reserves?.formattedReserves.find((r) =>
    stringEquals(r.underlyingAsset, getReserveAddressByAssetId(supplyAssetId)),
  )

  const { data: gasPrice, isLoading: isLoadingGasPrice } = useQuery({
    queryKey: ["gasPrice"],
    queryFn: async () => {
      const gasPriceBase = await evm.getGasPrice()
      const gasPriceSurplus = (gasPriceBase * 5n) / 100n
      return gasPriceBase + gasPriceSurplus
    },
  })

  const { data, isLoading: isLoadingBatch } = useQuery({
    enabled:
      options.enabled &&
      !!borrowReserve &&
      !!supplyReserve &&
      !!assetOut &&
      !!gasPrice,
    placeholderData: keepPreviousData,
    queryKey: [
      "borrow",
      "looping",
      assetInId,
      assetOutId,
      supplyAssetId,
      borrowAssetId,
      amount,
      multiplier,
      withEmode,
    ],
    queryFn: async () => {
      if (!account) throw new Error("Account not connected")
      if (!assetIn || !assetOut) throw new Error("Assets not found")
      if (!borrowReserve) throw new Error("Borrow reserve not found")
      if (!supplyReserve) throw new Error("Supply reserve not found")
      if (!gasPrice) throw new Error("Gas price base not found")

      const address = account.address
      const evmAddress = H160.fromAny(address)

      const { userEmodeCategoryId } = user ?? { userEmodeCategoryId: 0 }
      const isInEmode = userEmodeCategoryId === supplyReserve.eModeCategoryId

      const baseLtv = supplyReserve.formattedBaseLTVasCollateral
      const emodeLtv =
        supplyReserve.formattedEModeLtv !== "0"
          ? supplyReserve.formattedEModeLtv
          : baseLtv

      const loopingSteps = getLoopingSteps({
        initialAmount: amount,
        multiplier,
        ltv: isInEmode || withEmode ? emodeLtv : baseLtv,
      })

      const spotPrice = await sdk.api.router.getSpotPrice(
        Number(assetInId),
        Number(borrowAssetId),
      )

      const formattedSpotPrice = spotPrice
        ? Big(spotPrice.amount.toString())
            .div(Big(10).pow(spotPrice.decimals))
            .toString()
        : "1"

      const steps = loopingSteps.map((step) => ({
        borrow: step.borrow.times(formattedSpotPrice),
        supply: step.supply,
      }))

      const gasLimit = BigInt(
        gasLimitRecommendations[ProtocolAction.borrow]?.recommended ??
          "1000000",
      )

      const provider = new Web3Provider(evm.transport)
      const pool = new Pool(provider, { POOL: AaveV3HydrationMainnet.POOL })
      const poolBundle = new PoolBundle(provider, {
        POOL: AaveV3HydrationMainnet.POOL,
        WETH_GATEWAY: "",
      })

      const buildEvmTx = (tx: {
        from?: string
        to?: string
        data?: string
      }): AnyPapiTx =>
        papi.tx.EVM.call({
          source: Binary.fromHex(tx.from ?? evmAddress),
          target: Binary.fromHex(tx.to ?? ""),
          input: Binary.fromHex(tx.data ?? ""),
          value: [0n, 0n, 0n, 0n],
          gas_limit: gasLimit,
          max_fee_per_gas: [gasPrice, 0n, 0n, 0n],
          max_priority_fee_per_gas: [gasPrice, 0n, 0n, 0n],
          access_list: [],
          authorization_list: [],
          nonce: undefined,
        })

      printSteps(steps, borrowReserve, assetIn)

      const batch: BatchItem[] = []

      if (withEmode && !isInEmode) {
        const poolContract = pool.getContractInstance(pool.poolAddress)
        const emodeRawTx = await poolContract.populateTransaction.setUserEMode(
          supplyReserve.eModeCategoryId,
        )
        batch.push({
          type: "evm",
          data: buildEvmTx({ ...emodeRawTx, from: evmAddress }),
        })
      }

      let totalAmountOut = 0n

      for (const step of steps) {
        const { supply: supplyAmount, borrow: borrowAmount } = step

        if (borrowAmount.gt(0)) {
          const borrowTx = poolBundle.borrowTxBuilder.generateTxData({
            amount: bigShift(borrowAmount, borrowReserve.decimals)
              .mul(0.99)
              .toFixed(0),
            reserve: borrowReserve.underlyingAsset,
            interestRateMode: InterestRate.Variable,
            debtTokenAddress: borrowReserve.variableDebtTokenAddress,
            user: evmAddress,
            useOptimizedPath: false,
          })
          batch.push({
            type: "evm",
            data: buildEvmTx({
              ...borrowTx,
              from: borrowTx.from ?? evmAddress,
            }),
          })
        }

        if (supplyAmount.gt(0)) {
          const sell = await sdk.api.router.getBestSell(
            Number(assetIn.id),
            Number(assetOut.id),
            supplyAmount.toString(),
          )
          totalAmountOut += sell.amountOut
          batch.push({ type: "trade", data: sell })
        }
      }

      const minAmountOut = Big(totalAmountOut.toString())
        .times(Big(1).minus(Big(slippage).div(100)))
        .toString()

      const totalBorrow = steps
        .reduce((acc, curr) => acc.plus(curr.borrow), Big(0))
        .toString()
      const totalSupply = steps
        .reduce((acc, curr) => acc.plus(curr.supply), Big(0))
        .toString()

      return { batch, minAmountOut, totalBorrow, totalSupply }
    },
  })

  const { mutate: submitLooping, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (!data || !account) return

      const address = account.address

      const txs: AnyPapiTx[] = await Promise.all(
        data.batch.map(async (item) => {
          if (item.type === "trade") {
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

      console.log({ txs })

      return createBatchTx({
        txs,
        transaction: {
          toasts: {
            submitted: t("multiply.toast.onLoading", {
              symbol: assetOut?.symbol,
              value: amount,
            }),
            success: t("multiply.toast.onSuccess", {
              symbol: assetOut?.symbol,
              value: amount,
            }),
          },
        },
        options: {
          onSubmitted: options.onSubmitted,
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["borrow"] })
          },
        },
      })
    },
  })

  const isLoading = isLoadingBatch || isSubmitting || isLoadingGasPrice

  return {
    isLoading,
    submitLooping,
    minAmountOut: data?.minAmountOut ?? "0",
    totalBorrow: data?.totalBorrow ?? "0",
    totalSupply: data?.totalSupply ?? "0",
  }
}

export function printSteps(
  steps: LoopingStep[],
  borrowReserve: ComputedReserveData,
  assetIn: TAsset,
) {
  const stepsHumanized = steps.map((step) => ({
    borrow: formatCurrency(step.borrow.toString(), "en", {
      symbol: borrowReserve.symbol,
    }),
    supply: formatCurrency(step.supply.toString(), "en", {
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
      borrow: formatCurrency(
        steps.reduce((acc, curr) => acc.plus(curr.borrow), Big(0)).toString(),
        "en",
        {
          symbol: borrowReserve.symbol,
        },
      ),
      supply: formatCurrency(
        steps.reduce((acc, curr) => acc.plus(curr.supply), Big(0)).toString(),
        "en",
        {
          symbol: assetIn.symbol,
        },
      ),
    },
  })
}
