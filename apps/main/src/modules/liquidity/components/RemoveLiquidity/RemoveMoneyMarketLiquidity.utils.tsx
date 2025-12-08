import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { prop } from "remeda"
import { useDebounce } from "use-debounce"

import { AAVE_GAS_LIMIT, healthFactorQuery } from "@/api/aave"
import { StableSwapBase } from "@/api/pools"
import { bestSellQuery, Trade } from "@/api/trade"
import { calculateSlippage } from "@/api/utils/slippage"
import { calculatePoolFee } from "@/modules/liquidity/Liquidity.utils"
import { TReserve } from "@/modules/liquidity/Liquidity.utils"
import { AnyTransaction } from "@/modules/transactions/types"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scale, scaleHuman } from "@/utils/formatting"

import { useRemoveStablepoolLiquidityForm } from "./RemoveStablepoolLiquidity.utils"

export const useRemoveMoneyMarketLiquidity = ({
  erc20Id,
  stableswapId,
  pool,
  reserves,
  onSubmitted,
}: {
  erc20Id: string
  stableswapId: string
  pool: StableSwapBase
  reserves: TReserve[]
  onSubmitted: () => void
}) => {
  const { getAssetWithFallback, isErc20AToken } = useAssets()
  const { t } = useTranslation("liquidity")
  const { getTransferableBalance } = useAccountBalances()
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const createTransaction = useTransactionsStore(prop("createTransaction"))
  const getMinimumTradeAmount = useMinimumTradeAmount()

  const {
    liquidity: { slippage },
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()

  const meta = getAssetWithFallback(erc20Id)
  const balance = getTransferableBalance(erc20Id)
  const balanceShifted = scaleHuman(balance.toString(), meta.decimals)

  const initialReceiveAsset = reserves[0]?.meta

  const form = useRemoveStablepoolLiquidityForm({
    receiveAsset: initialReceiveAsset!,
    balance: balanceShifted,
    asset: { ...meta, iconId: meta.id },
  })

  const [removeAmountShifted = "0", receiveAsset, split, receiveAmount] =
    form.watch(["amount", "receiveAsset", "split", "receiveAmount"])
  const removeAmount = Big(scale(removeAmountShifted, meta.decimals))

  const [debouncedAmount] = useDebounce(removeAmountShifted, 300)
  const { data: trade } = useQuery(
    bestSellQuery(
      rpc,
      {
        assetIn: erc20Id,
        assetOut: split ? stableswapId : receiveAsset.id,
        amountIn: debouncedAmount,
        slippage: swapSlippage,
        address: account?.address ?? "",
      },
      true,
    ),
  )

  const amountOut = trade?.swap?.amountOut.toString() ?? "0"
  const amountOutShifted = scaleHuman(amountOut, receiveAsset.decimals)

  const tradeMinReceive = getMinimumTradeAmount(trade?.swap)?.toString() ?? "0"
  const tradeMinReceiveShifted = scaleHuman(
    tradeMinReceive,
    receiveAsset.decimals,
  )

  const receiveAssetsProportionally = (() => {
    const totalIssuance = pool.totalIssuance.toString()
    const fee = calculatePoolFee(pool.fee)
    const minReceive = Big(tradeMinReceive)

    if (minReceive.gt(0) && fee) {
      return reserves.map((reserve) => {
        const maxValue = minReceive
          .div(totalIssuance)
          .times(reserve.amount)
          .toFixed(0)

        const value = Big(maxValue)
          .minus(Big(slippage).times(maxValue).div(100))
          .toFixed(0)

        return { value, asset: reserve.meta }
      })
    }
  })()

  const receiveErc20Asset = receiveAssetsProportionally?.find((asset) =>
    isErc20AToken(asset.asset),
  )
  const toAsset = split ? (receiveErc20Asset?.asset ?? null) : receiveAsset
  const toAmount = split
    ? scaleHuman(receiveErc20Asset?.value ?? "0", toAsset?.decimals ?? 0)
    : receiveAmount

  const { data: healthFactor } = useQuery(
    healthFactorQuery(rpc, {
      address: account?.address ?? "",
      fromAsset: meta,
      fromAmount: debouncedAmount,
      toAsset,
      toAmount,
    }),
  )

  useEffect(() => {
    if (!split) {
      form.setValue("receiveAmount", amountOutShifted)
    }
  }, [amountOutShifted, form, split])

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!trade?.tx) throw new Error("Trade tx not found")
      if (!receiveAssetsProportionally)
        throw new Error("Receive assets not found")
      if (!account) throw new Error("Account not found")

      const { papi } = rpc

      const swapTx = trade?.tx

      let tx: AnyTransaction | undefined

      if (split) {
        const txs = [
          swapTx,
          papi.tx.Stableswap.remove_liquidity({
            pool_id: Number(pool.id),
            share_amount: BigInt(removeAmount.toFixed(0)),
            min_amounts_out: receiveAssetsProportionally.map((asset) => ({
              amount: BigInt(asset.value),
              asset_id: Number(asset.asset.id),
            })),
          }),
        ]
        tx = papi.tx.Dispatcher.dispatch_with_extra_gas({
          call: papi.tx.Utility.batch_all({
            calls: txs.map((t) => t.decodedCall),
          }).decodedCall,
          extra_gas: AAVE_GAS_LIMIT,
        })
      } else {
        tx = swapTx
      }

      if (!tx) throw new Error("Transaction not found")

      const tOptions = {
        value: removeAmountShifted,
        symbol: t("shares"),
        where: meta.symbol,
      }
      const toasts = {
        submitted: t(
          "liquidity.remove.moneyMarket.modal.toast.submitted",
          tOptions,
        ),
        success: t(
          "liquidity.remove.moneyMarket.modal.toast.success",
          tOptions,
        ),
      }

      await createTransaction(
        {
          tx,
          toasts,
        },
        { onSubmitted },
      )
    },
  })

  return {
    form,
    balance: balanceShifted,
    meta,
    reserves: reserves,
    receiveAssetsProportionally,
    receiveAsset,
    tradeMinReceive: tradeMinReceiveShifted,
    mutation,
    healthFactor,
  }
}

export const useMinimumTradeAmount = () => {
  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()

  return (trade?: Trade) =>
    trade
      ? trade.amountOut - calculateSlippage(trade.amountOut, swapSlippage)
      : undefined
}
