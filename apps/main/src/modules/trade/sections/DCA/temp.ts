import { useMutation, useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { minBudgetNativeQuery } from "@/api/constants"
import { spotPrice } from "@/api/spotPrice"
import { bestSellQuery } from "@/api/trade"
import { Period } from "@/components"
import {
  exchangeNative,
  INTERVAL_DCA_MS,
  MINUTE_MS,
} from "@/modules/trade/sections/DCA/DCA"
import { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { NATIVE_ASSET_ID } from "@/utils/consts"
import { scale, scaleHuman } from "@/utils/formatting"

const MIN_BLOCK_PERIOD = 5

const slippage = "0"

export const useDcaOrder = (
  sellAsset: TAsset | null,
  buyAsset: TAsset | null,
  interval: Period,
  sellAmount: string,
  blockTime: number,
  frequency?: number,
) => {
  const { papi, tradeUtils } = useRpcProvider()

  const { data: trade } = useQuery(
    // TODO this fails
    bestSellQuery(useRpcProvider(), {
      assetIn: sellAsset?.id ?? "",
      assetOut: buyAsset?.id ?? "",
      amountIn: sellAmount,
    }),
  )

  const { data: minBudgetNative } = useQuery(
    minBudgetNativeQuery(useRpcProvider()),
  )

  const period = interval.value * INTERVAL_DCA_MS[interval.type]

  const { data: price } = useQuery(
    spotPrice(useRpcProvider(), sellAsset?.id ?? "", NATIVE_ASSET_ID),
  )

  const amountInMin =
    sellAsset && price?.spotPrice && minBudgetNative
      ? exchangeNative(price.spotPrice, sellAsset, minBudgetNative)
      : "0"

  const toTx = useMutation({
    mutationFn: async ([address, maxRetries]: [
      address: string,
      maxRetries: number,
    ]) => {
      if (!sellAsset || !buyAsset) {
        return
      }

      const f = freq * MINUTE_MS
      const blockPeriod = toBlockPeriod(f, blockTime)
      const tx = papi.tx.DCA.schedule({
        schedule: {
          owner: address,
          period: Math.max(blockPeriod, MIN_BLOCK_PERIOD),
          max_retries: maxRetries,
          total_amount: BigInt(amountIn.toString()),
          slippage: Number(slippage) * 10000,
          stability_threshold: undefined,
          order: {
            type: "Sell",
            value: {
              asset_in: Number(sellAsset.id),
              asset_out: Number(buyAsset.id),
              amount_in: BigInt(amountInPerTrade.toString()),
              min_amount_out: BigInt(0),
              // route: tradeUtils.buildRoute(swaps),
              // TODO route is private
              route: [],
            },
          },
        },
        start_execution_block: undefined,
      })

      return {
        hex: tx.decodedCall,
        name: "dcaSchedule",
        get: () => {
          return tx
        },
      }
    },
  })

  if (!trade || !sellAsset) {
    return null
  }

  //   const { slippage } = this._config.deref()
  const { amountIn, swaps } = trade
  const priceDifference = Math.abs(trade.priceImpactPct)

  const periodMinutes = period / MINUTE_MS
  const minTradesNo = getMinimumTradesNo(amountIn.toString(), amountInMin)
  const optTradesNo = getOptimizedTradesNo(priceDifference)

  const tradeNo = frequency
    ? Math.round(periodMinutes / frequency)
    : optTradesNo

  const minFreq = Math.ceil(periodMinutes / minTradesNo)
  const optFreq = Math.round(periodMinutes / optTradesNo)
  const freq = Math.round(periodMinutes / tradeNo)
  const amountInPerTrade = Big(amountIn.toString()).div(tradeNo).toString()

  return {
    amountIn: scaleHuman(amountInPerTrade, sellAsset.decimals),
    amountInBudget: scaleHuman(amountIn, sellAsset.decimals),
    frequencyMin: minFreq,
    frequencyOpt: optFreq,
    frequency: freq,
    tradesNo: tradeNo,
    toTx,
  }
}

const getMinimumTradesNo = (amountIn: string, amountInMin: string): number => {
  return new Big(amountIn).div(amountInMin).mul(0.2).round().toNumber()
}

const getOptimizedTradesNo = (priceDifference: number): number => {
  const optTradesNo = Math.round(priceDifference * 10) || 1
  return optTradesNo < 3 ? 3 : optTradesNo
}

const toBlockPeriod = (periodMsec: number, blockTime: number): number =>
  Math.round(periodMsec / blockTime)
