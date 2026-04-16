import { InterestRate } from "@aave/contract-helpers"
import { EModeCategory } from "@galacticcouncil/money-market/ui-config"
import { formatHealthFactorResult } from "@galacticcouncil/money-market/utils"
import {
  bigShift,
  getAssetIdFromAddress,
  MONEY_MARKET_STRATEGY_ASSETS,
  safeConvertAnyToH160,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import Big from "big.js"
import { Enum } from "polkadot-api"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useDebounce } from "use-debounce"
import z from "zod"

import { AAVE_GAS_LIMIT } from "@/api/aave"
import { TAssetData } from "@/api/assets"
import {
  getStrategyPositionsQueryKey,
  useBorrowPoolBundleContract,
  useSetUsageAsCollateralTx,
  useSetUserEModeTx,
} from "@/api/borrow"
import { blockWeightsQuery } from "@/api/chain"
import { createProxyCall, getAccountProxies } from "@/api/proxy"
import { bestSellWithTxQuery } from "@/api/trade"
import { useCreateMultiplyEvmTx } from "@/modules/borrow/hooks/useCreateMultiplyEvmTx"
import { LEVERAGE_DEFAULT } from "@/modules/borrow/multiply/config/constants"
import {
  LoopStep,
  useLoopingSteps,
} from "@/modules/borrow/multiply/hooks/useLoopingSteps"
import { MultiplyAppProps } from "@/modules/borrow/multiply/MultiplyApp"
import { MultiplyAssetPair } from "@/modules/borrow/multiply/types"
import { validateLoopingEvmTx } from "@/modules/borrow/multiply/utils/looping"
import { useMinimumTradeAmount } from "@/modules/liquidity/components/RemoveLiquidity/RemoveMoneyMarketLiquidity.utils"
import {
  calculateChunkSize,
  getChunkByIndex,
} from "@/modules/transactions/hooks/useBatchTx"
import { AnyPapiTx } from "@/modules/transactions/types"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTradeSettings } from "@/states/tradeSettings"
import {
  isSubstrateTxResult,
  MultiTransactionConfig,
  useTransactionsStore,
} from "@/states/transactions"
import { scaleHuman, toDecimal } from "@/utils/formatting"
import {
  required,
  useValidateFormMaxBalance,
  validateMaxBalance,
} from "@/utils/validators"

const schema = z.object({
  amount: required,
  asset: z.custom<TAssetData>(),
  multiplier: z.number(),
  fee: z.string().optional(),
})

export type MultiplyFormValues = z.infer<typeof schema>

const useSchema = () => {
  const { account } = useAccount()
  const refineMaxBalance = useValidateFormMaxBalance()

  if (!account) {
    return schema
  }

  return schema.check(
    refineMaxBalance("amount", (form) => [form.asset, form.amount]),
  )
}

export const useMultiplyApp = ({
  collateralReserve,
  debtReserve,
  proxyCreationFee,
  strategy,
  proxies,
}: MultiplyAppProps) => {
  const rpc = useRpcProvider()
  const { getRelatedAToken, getAssetWithFallback, native } = useAssets()

  const { account } = useAccount()
  const { getTransferableBalance } = useAccountBalances()
  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()
  const getMinimumTradeAmount = useMinimumTradeAmount()
  const queryClient = useQueryClient()
  const { createTransaction } = useTransactionsStore()
  const poolBundleContract = useBorrowPoolBundleContract()

  const getSetUsageAsCollateralTx = useSetUsageAsCollateralTx()
  const getSetUserEModeTx = useSetUserEModeTx()
  const createEvmTx = useCreateMultiplyEvmTx()

  const assetId = getAssetIdFromAddress(collateralReserve.underlyingAsset)
  const { eModeCategory, isParityPair, collateralAssetId, debtAssetId } =
    strategy

  const collateralAsset = getAssetWithFallback(collateralAssetId)
  const borrowAsset = getAssetWithFallback(debtAssetId)
  const supplyAToken = getRelatedAToken(assetId)

  const enteredWithAsset = getAssetWithFallback(
    getEnterWithAssetId(strategy, collateralAssetId),
  )

  const hasEnoughNativeForFee = validateMaxBalance(
    toDecimal(getTransferableBalance(native.id), native.decimals),
    toDecimal(proxyCreationFee, native.decimals),
  )

  const accountAddress = account?.address

  const form = useForm<MultiplyFormValues>({
    mode: "onChange",
    defaultValues: {
      amount: "",
      asset: enteredWithAsset,
      multiplier: LEVERAGE_DEFAULT,
    },
    resolver: standardSchemaResolver(useSchema()),
  })

  useEffect(() => {
    if (!accountAddress) return

    if (!hasEnoughNativeForFee) {
      form.setError("fee", { message: "Not enough HDX to pay fee" })
    } else {
      form.clearErrors("fee")
    }
  }, [accountAddress, form, hasEnoughNativeForFee])

  const isStrategyAsset =
    MONEY_MARKET_STRATEGY_ASSETS.includes(collateralAssetId)

  const [amount, asset, multiplier] = form.watch([
    "amount",
    "asset",
    "multiplier",
  ])
  const [debouncedAmountIn = "0"] = useDebounce(amount, 300)
  const [debouncedMultiplier] = useDebounce(multiplier, 300)

  const { data: trade } = useQuery(
    bestSellWithTxQuery(rpc, {
      assetIn: asset.id,
      assetOut: supplyAToken?.id ?? "",
      amountIn: debouncedAmountIn,
      slippage: swapSlippage,
      address: accountAddress ?? "",
    }),
  )

  const minReceiveAmount = isStrategyAsset
    ? (getMinimumTradeAmount(trade?.swap)?.toString() ?? "0")
    : (trade?.swap.amountOut.toString() ?? "0")

  const minReceiveAmountShifted = scaleHuman(
    minReceiveAmount,
    supplyAToken?.decimals ?? 0,
  )

  const {
    data: { steps, targetDebt, totalCollateral, futureHF, netApy },
    isLoading,
  } = useLoopingSteps({
    amount: minReceiveAmountShifted,
    multiplier: debouncedMultiplier,
    supplyAssetId: collateralAssetId,
    borrowAssetId: debtAssetId,
    assetInId: borrowAsset.id,
    assetOutId: supplyAToken?.id ?? "",
    isParityPair,
    eModeCategory,
  })

  const hf = formatHealthFactorResult({
    currentHF: "-1",
    futureHF,
  })
  const getLoopingSteps = async (steps: LoopStep[], address: string) => {
    if (!poolBundleContract) throw new Error("Pool bundle contract not found")

    const evmAddress = safeConvertAnyToH160(address)

    return (
      await Promise.all(
        steps.map(async (step) => {
          const borrowTx = poolBundleContract.borrowTxBuilder.generateTxData({
            amount: bigShift(step.borrow, debtReserve.decimals).toFixed(0),
            reserve: debtReserve.underlyingAsset,
            interestRateMode: InterestRate.Variable,
            debtTokenAddress: debtReserve.variableDebtTokenAddress,
            user: evmAddress,
            useOptimizedPath: false,
          })

          validateLoopingEvmTx(borrowTx, "borrow")

          const builtTx = await rpc.sdk.tx
            .trade(step.trade)
            .withSlippage(swapSlippage)
            .withBeneficiary(address)
            .build()

          return [createEvmTx(borrowTx), builtTx.get()]
        }),
      )
    ).flat()
  }

  const { mutate: onSubmit, isPending: isSubmitting } = useMutation({
    mutationFn: async () => {
      if (!supplyAToken) throw new Error("Asset not found")
      if (!accountAddress) throw new Error("Account not found")
      if (!poolBundleContract) throw new Error("Pool bundle contract not found")

      const prevAccountProxies = proxies
      let newCreatedProxy: string | undefined
      const prevTransferableBalance = getTransferableBalance(supplyAToken.id)

      const blockWeights = await queryClient.fetchQuery(blockWeightsQuery(rpc))

      const blockWeightsData = blockWeights?.per_class.normal.max_extrinsic

      if (!blockWeightsData)
        throw new Error("Missing required parameters for batch transaction")

      const { chunkSize, batchCount } = await calculateChunkSize(
        rpc.papi,
        accountAddress,
        await getLoopingSteps(steps, accountAddress),
        blockWeightsData,
      )

      const tx: MultiTransactionConfig[] = [
        {
          stepTitle: "Create proxy",
          tx: async () => {
            if (!trade?.tx) {
              throw new Error("Trade not found")
            }

            const txs = [
              trade.tx,
              rpc.papi.tx.Proxy.create_pure({
                proxy_type: Enum("Any"),
                delay: 0,
                index: 0,
              }),
            ]

            const toasts = {
              submitted: "Creating proxy",
              success: "Proxy created",
            }

            return {
              title: "Create proxy",
              tx: rpc.papi.tx.Utility.batch_all({
                calls: txs.map((tx) => tx.decodedCall),
              }),
              toasts,
              successMode: "finalized",
            }
          },
        },
        {
          stepTitle: "Send funds",
          tx: async (res) => {
            const blockResults = res[0]

            let proxyAddress: string | undefined

            // can be also taken from events, but only for substrate wallet
            const balance = await rpc.sdk.client.balance.getErc20Balance(
              accountAddress,
              Number(supplyAToken.id),
            )
            const transferableBalance = balance.transferable
            const swappedAmount = transferableBalance - prevTransferableBalance

            if (!blockResults || !isSubstrateTxResult(blockResults)) {
              const newAccountProxies = await queryClient.fetchQuery(
                getAccountProxies(rpc, queryClient, accountAddress),
              )

              proxyAddress = newAccountProxies.find(
                (newProxy) => !prevAccountProxies.includes(newProxy),
              )
            } else {
              const newProxyAddress = rpc.papi.event.Proxy.PureCreated.filter(
                blockResults.events,
              ).find((event) => event.who === accountAddress)?.pure

              if (newProxyAddress) {
                proxyAddress = newProxyAddress

                queryClient.setQueriesData<string[]>(
                  {
                    queryKey: getAccountProxies(
                      rpc,
                      queryClient,
                      accountAddress,
                    ).queryKey,
                  },
                  (previousProxies) => [
                    ...(previousProxies ?? []),
                    newProxyAddress,
                  ],
                )
              }
            }

            if (!proxyAddress) {
              throw new Error("Proxy not found")
            }
            console.log("Proxy account:", proxyAddress)
            newCreatedProxy = proxyAddress

            const txs: AnyPapiTx[] = [
              rpc.papi.tx.Dispatcher.dispatch_with_extra_gas({
                call: rpc.papi.tx.Currencies.transfer({
                  currency_id: Number(supplyAToken.id),
                  dest: proxyAddress,
                  amount: BigInt(swappedAmount),
                }).decodedCall,
                extra_gas: AAVE_GAS_LIMIT,
              }),
              createProxyCall(
                rpc.papi,
                proxyAddress,
                rpc.papi.tx.EVMAccounts.bind_evm_address().decodedCall,
              ),
            ]

            if (collateralReserve.isIsolated) {
              const enableCollateralTx = await getSetUsageAsCollateralTx(
                collateralReserve.underlyingAsset,
                true,
                proxyAddress,
              )

              txs.push(
                createProxyCall(
                  rpc.papi,
                  proxyAddress,
                  enableCollateralTx.decodedCall,
                  true,
                ),
              )
            }

            if (eModeCategory !== EModeCategory.NONE) {
              const eModeTx = await getSetUserEModeTx(
                eModeCategory,
                proxyAddress,
              )

              const proxyCall = createProxyCall(
                rpc.papi,
                proxyAddress,
                eModeTx.decodedCall,
                true,
              )

              txs.push(proxyCall)
            }

            const tx = rpc.papi.tx.Utility.batch_all({
              calls: txs.map((tx) => tx.decodedCall),
            })

            return {
              title: "Send funds",
              tx,
              toasts: {
                submitted: "Sending funds",
                success: "Funds sent",
              },
            }
          },
        },
      ]

      const chunkIndices =
        batchCount === 1 ? [null] : [...Array(batchCount).keys()]

      for (const i of chunkIndices) {
        tx.push({
          stepTitle: "Looping",
          tx: async (res) => {
            if (!newCreatedProxy) {
              throw new Error("Proxy not found")
            }

            const txs = await getLoopingSteps(steps, newCreatedProxy)
            const calls = i === null ? txs : getChunkByIndex(txs, i, chunkSize)

            console.log("response from prev steps:", res)
            console.log(i === null ? "looping txs:" : "looping chunk:", calls)
            console.log("Proxy account:", newCreatedProxy)

            return {
              title: "Looping",
              tx: createProxyCall(
                rpc.papi,
                newCreatedProxy,
                rpc.papi.tx.Utility.batch_all({
                  calls: calls.map((tx) => tx.decodedCall),
                }).decodedCall,
                true,
              ),
              toasts: {
                submitted: "Looping",
                success: "Looped",
              },
            }
          },
        })
      }

      await createTransaction({
        tx,
        invalidateQueries: [getStrategyPositionsQueryKey(accountAddress)],
      })
    },
  })

  return {
    form,
    hf,
    onSubmit,
    totalCollateral,
    targetDebt,
    isLoading,
    isSubmitting,
    errors: steps.flatMap((step) => step.swapErrors),
    collateralAsset,
    borrowAsset,
    supplyAToken,
    netApy: Big(netApy).mul(100).toString(),
  }
}

export const getEnterWithAssetId = (
  strategy: MultiplyAssetPair,
  collateralAssetId: string,
) => {
  if (strategy.enterWithAssetId) {
    return strategy.enterWithAssetId
  }

  return collateralAssetId
}
