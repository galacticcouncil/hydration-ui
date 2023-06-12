import { useApiIds } from "api/consts"
import { useOmnipoolAssets } from "api/omnipool"
import { useAllTrades, useTradeVolumes } from "api/volume"
import { useMemo } from "react"
import BN from "bignumber.js"
import { useAssetMetaList } from "api/assetMeta"
import { useSpotPrices } from "api/spotPrice"
import { getFloatingPointAmount } from "utils/balance"

const withoutRefresh = true
const VISIBLE_TRADE_NUMBER = 10

export const useRecentTradesTableData = (assetId?: string) => {
  const omnipoolAssets = useOmnipoolAssets(withoutRefresh)
  const apiIds = useApiIds()
  const allTrades = useAllTrades()
  //const volumes = useTradeVolumes([assetId])

  //console.log(volumes, "volume")

  const omnipoolAssetsIds = omnipoolAssets.data?.map((a) => a.id) ?? []

  const assetMetas = useAssetMetaList(omnipoolAssetsIds)
  const spotPrices = useSpotPrices(
    omnipoolAssetsIds,
    apiIds.data?.usdId,
    withoutRefresh,
  )

  const queries = [
    omnipoolAssets,
    apiIds,
    assetMetas,
    allTrades,
    //...volumes,
    ...spotPrices,
  ]

  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !allTrades.data ||
      !omnipoolAssets.data ||
      !apiIds.data ||
      !assetMetas.data ||
      spotPrices.some((q) => !q.data)
    )
      return []

    const trades = allTrades.data.events
      .sort(
        (a, b) =>
          new Date(b.block.timestamp).getTime() -
          new Date(a.block.timestamp).getTime(),
      )
      .slice(0) // copy an array to avoid the mutating
      .reduce(
        (memo, trade, i, arr) => {
          if (i === VISIBLE_TRADE_NUMBER - 1) arr.splice(1) // break iteration
          if (
            !memo.find((memoTrade) => memoTrade.id === trade.id) &&
            memo.length < VISIBLE_TRADE_NUMBER
          ) {
            const isBuy = trade.name === "Omnipool.BuyExecuted"

            const assetIn = trade.args.assetIn.toString()
            const amountInRaw = new BN(trade.args.amountIn)
            const assetOut = trade.args.assetOut.toString()
            const amountOutRaw = new BN(trade.args.amountOut)

            const assetMetaIn = assetMetas.data.find(
              (assetMeta) => assetMeta.id === assetIn,
            )
            const assetMetaOut = assetMetas.data.find(
              (assetMeta) => assetMeta.id === assetOut,
            )

            const spotPriceIn = spotPrices.find(
              (spotPrice) => spotPrice.data?.tokenIn === assetIn,
            )
            const spotPriceOut = spotPrices.find(
              (spotPrice) => spotPrice.data?.tokenIn === assetOut,
            )

            const amountIn = getFloatingPointAmount(
              amountInRaw,
              assetMetaIn?.decimals.toNumber() ?? 12,
            )
            const amountOut = getFloatingPointAmount(
              amountOutRaw,
              assetMetaOut?.decimals.toNumber() ?? 12,
            )

            const totalValue = amountIn
              .multipliedBy(spotPriceIn?.data?.spotPrice ?? 1)
              .plus(amountOut.multipliedBy(spotPriceOut?.data?.spotPrice ?? 1))

            if (assetMetaIn && assetMetaOut)
              memo.push({
                id: trade.id,
                isBuy,
                isSell: !isBuy,
                amountIn,
                amountOut,
                assetInSymbol: assetMetaIn.symbol,
                assetOutSymbol: assetMetaOut?.symbol,
                totalValue,
                account: trade.args.who,
                date: new Date(trade.block.timestamp),
              })
          }
          return memo
        },
        [] as Array<{
          id: string
          isBuy: boolean
          isSell: boolean
          amountIn: BN
          amountOut: BN
          totalValue: BN
          account: string
          assetInSymbol: string
          assetOutSymbol: string
          date: Date
        }>,
      )

    return trades
  }, [
    allTrades.data,
    apiIds.data,
    assetMetas.data,
    omnipoolAssets.data,
    spotPrices,
  ])

  return { data, isLoading: isInitialLoading }
}

export type TRecentTradesTable = typeof useRecentTradesTableData
export type TRecentTradesTableData = ReturnType<TRecentTradesTable>["data"]
