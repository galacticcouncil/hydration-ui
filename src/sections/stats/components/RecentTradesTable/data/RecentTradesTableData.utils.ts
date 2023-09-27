import { useApiIds } from "api/consts"
import { useOmnipoolAssets } from "api/omnipool"
import { useSpotPrices } from "api/spotPrice"
import { useAllTrades } from "api/volume"
import BN from "bignumber.js"
import { useMemo } from "react"
import { getFloatingPointAmount } from "utils/balance"
import { useDisplayAssetStore } from "utils/displayAsset"
import { useRpcProvider } from "providers/rpcProvider"

const withoutRefresh = true
const VISIBLE_TRADE_NUMBER = 10

export const useRecentTradesTableData = (assetId?: string) => {
  const { assets } = useRpcProvider()
  const omnipoolAssets = useOmnipoolAssets(withoutRefresh)
  const apiIds = useApiIds()
  const allTrades = useAllTrades()
  const displayAsset = useDisplayAssetStore()

  const omnipoolAssetsIds = omnipoolAssets.data?.map((a) => a.id) ?? []

  const spotPrices = useSpotPrices(
    omnipoolAssetsIds,
    displayAsset.stableCoinId,
    withoutRefresh,
  )

  const queries = [omnipoolAssets, apiIds, allTrades, ...spotPrices]

  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !allTrades.data ||
      !omnipoolAssets.data ||
      !apiIds.data ||
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
          const isSelectedAsset = assetId
            ? assetId === trade.args.assetIn.toString() ||
              assetId === trade.args.assetOut.toString()
            : true

          if (memo.length === VISIBLE_TRADE_NUMBER) arr.splice(1) // break iteration
          if (
            isSelectedAsset &&
            !memo.find((memoTrade) => memoTrade.id === trade.id) &&
            memo.length < VISIBLE_TRADE_NUMBER
          ) {
            const isBuy = trade.name === "Omnipool.BuyExecuted"

            const assetIn = trade.args.assetIn.toString()
            const amountInRaw = new BN(trade.args.amountIn)
            const assetOut = trade.args.assetOut.toString()
            const amountOutRaw = new BN(trade.args.amountOut)

            const assetMetaIn = assets.getAsset(assetIn)
            const assetMetaOut = assets.getAsset(assetOut)

            const spotPriceIn = spotPrices.find(
              (spotPrice) => spotPrice?.data?.tokenIn === assetIn,
            )?.data
            const spotPriceOut = spotPrices.find(
              (spotPrice) => spotPrice?.data?.tokenIn === assetOut,
            )?.data

            const amountIn = getFloatingPointAmount(
              amountInRaw,
              assetMetaIn.decimals,
            )
            const amountOut = getFloatingPointAmount(
              amountOutRaw,
              assetMetaOut.decimals,
            )

            const totalValue = amountIn
              .multipliedBy(spotPriceIn?.spotPrice ?? 1)
              .plus(amountOut.multipliedBy(spotPriceOut?.spotPrice ?? 1))

            if (assetMetaIn && assetMetaOut)
              memo.push({
                id: trade.id,
                isBuy,
                isSell: !isBuy,
                amountIn,
                amountOut,
                assetInSymbol: assetMetaIn.symbol,
                assetOutSymbol: assetMetaOut?.symbol,
                assetInId: assetMetaIn.id,
                assetOutId: assetMetaOut.id,
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
          assetInId: string
          assetOutId: string
        }>,
      )

    return trades
  }, [
    allTrades.data,
    omnipoolAssets.data,
    apiIds.data,
    spotPrices,
    assetId,
    assets,
  ])

  return { data, isLoading: isInitialLoading }
}

export type TRecentTradesTable = typeof useRecentTradesTableData
export type TRecentTradesTableData = ReturnType<TRecentTradesTable>["data"]
