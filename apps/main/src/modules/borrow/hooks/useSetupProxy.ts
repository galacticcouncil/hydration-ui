import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Enum } from "polkadot-api"
import { useForm } from "react-hook-form"
import { useDebounce } from "use-debounce"
import z from "zod"

import { AAVE_GAS_LIMIT } from "@/api/aave"
import { TAssetData } from "@/api/assets"
import { useSetUsageAsCollateralTx } from "@/api/borrow"
import {
  createProxyCall,
  filterAccountProxies,
  getAllProxies,
} from "@/api/proxy"
import { bestSellWithTxQuery } from "@/api/trade"
import { SetupProxyAppProps } from "@/modules/borrow/multiply/components/SetupProxyApp"
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
  positive,
  required,
  useValidateFormMaxBalance,
  validateMaxBalance,
} from "@/utils/validators"

export type TSetupProxyFormValues = {
  asset: TAssetData
  amount: string
  fee?: string
}

export const useSetupProxy = ({
  collateralReserve,
  proxies,
  proxyCreationFee,
}: SetupProxyAppProps) => {
  const rpc = useRpcProvider()
  const { getAssetWithFallback, getRelatedAToken, native } = useAssets()
  const { getTransferableBalance } = useAccountBalances()
  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()
  const { account } = useAccount()
  const { createTransaction } = useTransactionsStore()
  const assetId = getAssetIdFromAddress(collateralReserve.underlyingAsset)
  const getMinimumTradeAmount = useMinimumTradeAmount()
  const getSetUsageAsCollateralTx = useSetUsageAsCollateralTx()
  const asset = getAssetWithFallback(assetId)
  const queryClient = useQueryClient()
  const aTokenMeta = getRelatedAToken(asset.id)

  const isIsolated = collateralReserve.isIsolated
  const feeHuman = scaleHuman(proxyCreationFee.toString(), native.decimals)

  const refineMaxBalance = useValidateFormMaxBalance()

  const form = useForm<TSetupProxyFormValues>({
    mode: "onChange",
    defaultValues: {
      asset,
      amount: "",
    },
    resolver: standardSchemaResolver(
      z
        .object({
          asset: z.custom<TAssetData>(),
          amount: required.pipe(positive),
        })
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
        ),
    ),
  })

  const [amountIn, assetIn] = form.watch(["amount", "asset"])
  const [debouncedAmountIn = "0"] = useDebounce(amountIn, 300)

  const { data: trade } = useQuery(
    bestSellWithTxQuery(rpc, {
      assetIn: assetIn.id,
      assetOut: aTokenMeta?.id ?? "",
      amountIn: debouncedAmountIn,
      slippage: swapSlippage,
      address: account?.address ?? "",
    }),
  )

  const minReceiveAmount = getMinimumTradeAmount(trade?.swap)?.toString() ?? "0"
  const minReceiveAmountShifted = aTokenMeta
    ? scaleHuman(minReceiveAmount, aTokenMeta.decimals)
    : undefined

  const onSubmit = async (data: TSetupProxyFormValues) => {
    if (!aTokenMeta) {
      throw new Error("Asset not found")
    }

    if (!account?.address) {
      throw new Error("Account not found")
    }

    const prevAccountProxies = proxies ?? []

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
              console.log(blockResults.events)
              proxyAddress = rpc.papi.event.Proxy.PureCreated.filter(
                blockResults.events,
              ).find((event) => event.who === account.address)?.pure
            }
            console.log(proxyAddress)
            if (!proxyAddress) {
              throw new Error("Proxy not found")
            }

            const txs = [
              trade.tx,
              rpc.papi.tx.Dispatcher.dispatch_with_extra_gas({
                call: rpc.papi.tx.Currencies.transfer({
                  currency_id: Number(aTokenMeta.id),
                  dest: proxyAddress,
                  amount: BigInt(scale(data.amount, aTokenMeta.decimals)),
                }).decodedCall,
                extra_gas: AAVE_GAS_LIMIT,
              }),
              rpc.papi.tx.Currencies.transfer({
                currency_id: 20,
                dest: proxyAddress,
                amount: 100000000000000n,
              }),
              createProxyCall(
                rpc.papi,
                proxyAddress,
                rpc.papi.tx.EVMAccounts.bind_evm_address().decodedCall,
              ),
            ]

            if (isIsolated) {
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
      ],
      invalidateQueries: [
        ["allProxies"],
        ["accountProxies", account?.address ?? ""],
      ],
    })
  }

  return {
    form,
    onSubmit,
    minReceiveAmountShifted,
    asset,
    aTokenMeta,
    feeHuman,
  }
}
