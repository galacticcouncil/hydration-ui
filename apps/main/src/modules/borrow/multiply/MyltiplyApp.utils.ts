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
import Big from "big.js"
import { Enum } from "polkadot-api"
import { useForm } from "react-hook-form"
import { useDebounce } from "use-debounce"
import { z } from "zod"

import { AAVE_GAS_LIMIT } from "@/api/aave"
import { TAssetData } from "@/api/assets"
import {
  useBorrowPoolBundleContract,
  useSetUsageAsCollateralTx,
  useSetUserEModeTx,
} from "@/api/borrow"
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
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTradeSettings } from "@/states/tradeSettings"
import {
  isSubstrateTxResult,
  useTransactionsStore,
} from "@/states/transactions"
import { scale, scaleHuman, toDecimal } from "@/utils/formatting"
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
        message: "Not HDX to pay fee",
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

    const slippageFactor = isStrategyAsset
      ? new Big(1).minus(new Big(swapSlippage).div(100))
      : new Big(1)

    const evmAddress = safeConvertAnyToH160(address)

    return (
      await Promise.all(
        steps.map(async (step) => {
          const borrowTx = poolBundleContract.borrowTxBuilder.generateTxData({
            amount: bigShift(step.borrow, debtReserve.decimals)
              .times(slippageFactor)
              .toFixed(0),
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

    await createTransaction({
      tx: [
        {
          stepTitle: "Create proxy",
          tx: async () => {
            const tx = rpc.papi.tx.Proxy.create_pure({
              proxy_type: Enum("Any"),
              delay: 0,
              index: 0,
            })
            const toasts = {
              submitted: "Creating proxy",
              success: "Proxy created",
            }

            return {
              title: "Create proxy",
              tx: tx,
              toasts,
              successMode: "finalized",
            }
          },
        },
        {
          stepTitle: "Send funds",
          tx: async (res) => {
            if (!trade?.tx) {
              throw new Error("Trade not found")
            }

            const blockResults = res[0]

            let proxyAddress: string | undefined

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
              console.log(blockResults.events, res)

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
            console.log(proxyAddress)
            if (!proxyAddress) {
              throw new Error("Proxy not found")
            }

            newCreateadProxy = proxyAddress

            const txs = [
              trade.tx,
              rpc.papi.tx.Dispatcher.dispatch_with_extra_gas({
                call: rpc.papi.tx.Currencies.transfer({
                  currency_id: Number(supplyAToken.id),
                  dest: proxyAddress,
                  amount: BigInt(scale(amount, supplyAToken.decimals)),
                }).decodedCall,
                extra_gas: AAVE_GAS_LIMIT,
              }),
              rpc.papi.tx.Currencies.transfer({
                currency_id: 20,
                dest: proxyAddress,
                amount: 10000000000000n,
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
                ),
              )
            }

            if (eModeCategory !== EModeCategory.NONE) {
              const eModeTx = await getSetUserEModeTx(eModeCategory)

              txs.push(
                createProxyCall(rpc.papi, proxyAddress, eModeTx.decodedCall),
              )
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
        {
          stepTitle: "Looping",
          tx: async () => {
            if (!newCreateadProxy) {
              throw new Error("Proxy not found")
            }

            const txs = await getLoopingSteps(steps, newCreateadProxy)

            console.log(newCreateadProxy, txs)

            return {
              title: "Looping",
              tx: createProxyCall(
                rpc.papi,
                newCreateadProxy,
                rpc.papi.tx.Utility.batch_all({
                  calls: txs.map((tx) => tx.decodedCall),
                }).decodedCall,
              ),
              toasts: {
                submitted: "Looping",
                success: "Looped",
              },
            }
          },
        },
      ],
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
  }
}
