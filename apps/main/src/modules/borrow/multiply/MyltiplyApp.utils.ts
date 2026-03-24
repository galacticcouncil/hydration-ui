import { InterestRate } from "@aave/contract-helpers"
import { useMoneyMarketData } from "@galacticcouncil/money-market/hooks"
import { EModeCategory } from "@galacticcouncil/money-market/ui-config"
import {
  formatHealthFactorResult,
  getReserveAssetIdByAddress,
} from "@galacticcouncil/money-market/utils"
import {
  bigShift,
  getAssetIdFromAddress,
  MONEY_MARKET_STRATEGY_ASSETS,
  safeConvertAnyToH160,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Enum } from "polkadot-api"
import { useForm } from "react-hook-form"
import { useDebounce } from "use-debounce"
import { z } from "zod/v4"

import { AAVE_GAS_LIMIT } from "@/api/aave"
import { TAssetData } from "@/api/assets"
import {
  useBorrowPoolBundleContract,
  useSetUsageAsCollateralTx,
  useSetUserEModeTx,
} from "@/api/borrow"
import { blockWeightsQuery } from "@/api/chain"
import {
  createProxyCall,
  filterAccountProxies,
  getAllProxies,
} from "@/api/proxy"
import { bestSellWithTxQuery } from "@/api/trade"
import { useCreateLoopingEvmTx } from "@/modules/borrow/hooks/useCreateLoopingEvmTx"
import {
  LoopStep,
  useLoopingSteps,
} from "@/modules/borrow/multiply/hooks/useLoopingSteps"
import { MultiplyAppProps } from "@/modules/borrow/multiply/MultiplyApp"
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

export const LEVERAGE_MIN = 1.1
export const LEVERAGE_STEP = 0.1
export const LEVERAGE_DEFAULT = 2

const schema = z.object({
  amount: required,
  asset: z.custom<TAssetData>(),
  multiplier: z.number(),
  fee: z.string().optional(),
})

export type MultiplyFormValues = z.infer<typeof schema>

const useSchema = ({ proxyCreationFee }: { proxyCreationFee: bigint }) => {
  const { native } = useAssets()
  const { account } = useAccount()
  const refineMaxBalance = useValidateFormMaxBalance()
  const { getTransferableBalance } = useAccountBalances()

  if (!account) {
    return schema
  }

  return schema
    .check(refineMaxBalance("amount", (form) => [form.asset, form.amount]))
    .refine(
      () =>
        validateMaxBalance(
          toDecimal(getTransferableBalance(native.id), native.decimals),
          toDecimal(proxyCreationFee, native.decimals),
        ),
      {
        error: "Not HDX to pay fee",
        path: ["fee"],
      },
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
  const { getRelatedAToken, getAssetWithFallback } = useAssets()
  const { user } = useMoneyMarketData()
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
  const createEvmTx = useCreateLoopingEvmTx()

  const assetId = getAssetIdFromAddress(collateralReserve.underlyingAsset)
  const { enterWithAssetId, eModeCategory, isParityPair } = strategy

  const supplyAssetId = getAssetIdFromAddress(collateralReserve.underlyingAsset)
  const borrowAssetId = enterWithAssetId
    ? enterWithAssetId
    : getReserveAssetIdByAddress(debtReserve.underlyingAsset)

  const supplyAsset = getAssetWithFallback(supplyAssetId)
  const supplyAToken = getRelatedAToken(assetId)
  const borrowAsset = getAssetWithFallback(borrowAssetId)

  const enteredWithAsset = enterWithAssetId
    ? getAssetWithFallback(enterWithAssetId)
    : supplyAsset

  const form = useForm<MultiplyFormValues>({
    mode: "onChange",
    defaultValues: {
      amount: "",
      asset: enteredWithAsset,
      multiplier: LEVERAGE_DEFAULT,
    },
    resolver: standardSchemaResolver(useSchema({ proxyCreationFee })),
  })

  const isStrategyAsset = MONEY_MARKET_STRATEGY_ASSETS.includes(supplyAssetId)

  const [amount, asset, multiplier] = form.watch([
    "amount",
    "asset",
    "multiplier",
  ])
  const [debouncedAmountIn = "0"] = useDebounce(amount, 300)
  const { data: trade } = useQuery(
    bestSellWithTxQuery(rpc, {
      assetIn: asset.id,
      assetOut: supplyAToken?.id ?? "",
      amountIn: debouncedAmountIn,
      slippage: swapSlippage,
      address: account?.address ?? "",
    }),
  )

  const minReceiveAmount = isStrategyAsset
    ? (getMinimumTradeAmount(trade?.swap)?.toString() ?? "0")
    : (trade?.swap.amountOut.toString() ?? "0")

  const minReceiveAmountShifted = scaleHuman(
    minReceiveAmount,
    supplyAToken?.decimals ?? 0,
  )

  const currentHF = user?.healthFactor ?? ""
  const futureHF = currentHF // @TODO: Calculate future HF

  const hf = formatHealthFactorResult({
    currentHF: currentHF,
    futureHF: futureHF,
  })

  const {
    data: { steps, targetDebt, totalCollateral },
    isLoading,
  } = useLoopingSteps({
    amount: minReceiveAmountShifted,
    multiplier,
    supplyAssetId,
    borrowAssetId,
    assetInId: borrowAsset.id,
    assetOutId: supplyAToken?.id ?? "",
    isParityPair,
    eModeCategory,
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

  const onSubmit = async () => {
    if (!supplyAToken) throw new Error("Asset not found")
    if (!account?.address) throw new Error("Account not found")
    if (!poolBundleContract) throw new Error("Pool bundle contract not found")

    const prevAccountProxies = proxies
    let newCreateadProxy: string | undefined
    const prevTransferableBalance = getTransferableBalance(supplyAToken.id)

    const blockWeights = await queryClient.fetchQuery(blockWeightsQuery(rpc))

    const blockWeightsData = blockWeights?.per_class.normal.max_extrinsic

    if (!blockWeightsData)
      throw new Error("Missing required parameters for batch transaction")

    const { chunkSize, index } = await calculateChunkSize(
      rpc.papi,
      account.address,
      await getLoopingSteps(steps, account.address),
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
            account.address,
            Number(supplyAToken.id),
          )
          const transferableBalance = balance.transferable
          const swappedAmount = transferableBalance - prevTransferableBalance

          if (!blockResults || !isSubstrateTxResult(blockResults)) {
            const newAllProxies = await queryClient.fetchQuery(
              getAllProxies(rpc),
            )

            const newAccountProxies = filterAccountProxies(
              newAllProxies,
              account?.address ?? "",
            ).map((proxy) => proxy.keyArgs[0].toString())

            proxyAddress = newAccountProxies.find(
              (newProxy) => !prevAccountProxies.includes(newProxy),
            )
          } else {
            const newAllProxies = await queryClient.fetchQuery(
              getAllProxies(rpc),
            )

            const newAccountProxies = filterAccountProxies(
              newAllProxies,
              account?.address ?? "",
            ).map((proxy) => proxy.keyArgs[0].toString())

            const newProxy = newAccountProxies.find(
              (newProxy) => !prevAccountProxies.includes(newProxy),
            )

            console.log({ newProxy, newAccountProxies })
            proxyAddress = rpc.papi.event.Proxy.PureCreated.filter(
              blockResults.events,
            ).find((event) => event.who === account.address)?.pure
          }

          if (!proxyAddress) {
            throw new Error("Proxy not found")
          }
          console.log("Proxy account:", proxyAddress)
          newCreateadProxy = proxyAddress

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
            const eModeTx = await getSetUserEModeTx(eModeCategory, proxyAddress)

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

    if (index === 1) {
      tx.push({
        stepTitle: "Looping",
        tx: async (res) => {
          if (!newCreateadProxy) {
            throw new Error("Proxy not found")
          }

          const txs = await getLoopingSteps(steps, newCreateadProxy)

          console.log("response from prev steps:", res)

          console.log("looping txs:", txs)
          console.log("Proxy account:", newCreateadProxy)

          return {
            title: "Looping",
            tx: createProxyCall(
              rpc.papi,
              newCreateadProxy,
              rpc.papi.tx.Utility.batch_all({
                calls: txs.map((tx) => tx.decodedCall),
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
    } else {
      Array.from({ length: index }, (_, i) => {
        tx.push({
          stepTitle: "Looping",
          tx: async (res) => {
            if (!newCreateadProxy) {
              throw new Error("Proxy not found")
            }

            const txs = await getLoopingSteps(steps, newCreateadProxy)
            const chunk = getChunkByIndex(txs, i, chunkSize)

            console.log("response from prev steps:", res)

            console.log("looping chunk:", chunk)
            console.log("Proxy account:", newCreateadProxy)

            return {
              title: "Looping",
              tx: createProxyCall(
                rpc.papi,
                newCreateadProxy,
                rpc.papi.tx.Utility.batch_all({
                  calls: chunk.map((tx) => tx.decodedCall),
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
      })
    }

    await createTransaction({
      tx,
      invalidateQueries: [
        ["allProxies"],
        ["accountProxies", account?.address ?? ""],
      ],
    })
  }

  return {
    form,
    hf,
    onSubmit,
    totalCollateral,
    targetDebt,
    isLoading,
    errors: steps.flatMap((step) => step.swapErrors),
    supplyAsset,
    borrowAsset,
    supplyAToken,
  }
}
