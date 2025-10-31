import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { prop } from "remeda"
import { useDebounce } from "use-debounce"

import { AAVE_GAS_LIMIT, healthFactorAfterWithdrawQuery } from "@/api/aave"
import { StableSwapBase } from "@/api/pools"
import { bestSellQuery, singleTradeTx, Trade } from "@/api/trade"
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
}: {
  erc20Id: string
  stableswapId: string
  pool: StableSwapBase
  reserves: TReserve[]
}) => {
  const { getAssetWithFallback, isErc20AToken } = useAssets()
  const { t } = useTranslation("liquidity")
  const { getTransferableBalance } = useAccountBalances()
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const createTransaction = useTransactionsStore(prop("createTransaction"))

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
    receiveAssets: reserves.map((reserve) => reserve.meta),
    balance: balanceShifted,
    asset: { ...meta, iconId: meta.id },
  })

  const [removeAmountShifted = "0", receiveAsset, split] = form.watch([
    "amount",
    "receiveAsset",
    "split",
  ])
  const removeAmount = Big(scale(removeAmountShifted, meta.decimals))

  const [debouncedAmount] = useDebounce(removeAmountShifted, 300)
  const { data: trade } = useQuery(
    bestSellQuery(rpc, {
      assetIn: erc20Id,
      assetOut: split ? stableswapId : receiveAsset.id,
      amountIn: debouncedAmount,
    }),
  )
  //@TODO: implement withdraw all function

  const { data: healthFactor } = useQuery(
    healthFactorAfterWithdrawQuery(useRpcProvider(), {
      address: account?.address ?? "",
      assetId: meta && isErc20AToken(meta) ? meta.underlyingAssetId : "",
      amount: debouncedAmount,
    }),
  )

  const amountOut = trade?.amountOut.toString() ?? "0"
  const amountOutShifted = scaleHuman(amountOut, meta.decimals)
  const minimumTradeAmount = useMinimumTradeAmount(trade)?.toString() ?? "0"
  const minimumTradeAmountShifted = scaleHuman(
    minimumTradeAmount,
    meta.decimals,
  )

  const receiveAssetsProportionally = (() => {
    const totalIssuance = pool.totalIssuance.toString()
    const fee = calculatePoolFee(pool.fee)

    if (removeAmount.gt(0) && fee) {
      return reserves.map((reserve) => {
        const maxValue = removeAmount
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

  useEffect(() => {
    if (!split) {
      form.setValue("receiveAmount", amountOutShifted)
    }
  }, [amountOutShifted, form, split])

  const mutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!trade) throw new Error("Trade not found")
      if (!receiveAssetsProportionally)
        throw new Error("Receive assets not found")
      if (!account) throw new Error("Account not found")

      const {
        papi,
        sdk: { tx: SdkTx },
      } = rpc

      const builtTx = await singleTradeTx(
        SdkTx,
        trade,
        swapSlippage,
        account.address,
      )

      let tx: AnyTransaction | undefined

      if (split) {
        const txs = [
          builtTx.get(),
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
        tx = builtTx.get()
      }

      if (!tx) throw new Error("Transaction not found")

      const toasts = {
        submitted: t("liquidity.remove.moneyMarket.modal.toast.submitted", {
          value: removeAmount.toFixed(0),
          symbol: t("shares"),
          where: meta.symbol,
        }),
        success: t("liquidity.remove.moneyMarket.modal.toast.success", {
          value: removeAmount.toFixed(0),
          symbol: t("shares"),
          where: meta.symbol,
        }),
      }

      await createTransaction({
        tx,
        toasts,
      })
    },
  })

  return {
    form,
    balance: balanceShifted,
    meta,
    reserves: reserves,
    receiveAssetsProportionally,
    receiveAsset,
    minimumTradeAmountShifted,
    mutation,
    healthFactor,
  }
}

const useMinimumTradeAmount = (trade?: Trade) => {
  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()

  if (!trade) return undefined

  return trade.amountOut - calculateSlippage(trade.amountOut, swapSlippage)
}
