import { useApiIds } from "api/consts"
import { useOmnipoolAssets } from "api/omnipool"
import { TradeType, useTradeVolumes } from "api/volume"
import { useMemo } from "react"
import { BN_0 } from "utils/constants"
import BN from "bignumber.js"
import { useAssetMetaList } from "api/assetMeta"
import { useSpotPrices } from "api/spotPrice"
import { getFloatingPointAmount } from "utils/balance"

const withoutRefresh = true

export const useRecentTradesTableData = () => {
  const omnipoolAssets = useOmnipoolAssets(withoutRefresh)
  const apiIds = useApiIds()

  const omnipoolAssetsIds = omnipoolAssets.data?.map((a) => a.id) ?? []

  const volumes = useTradeVolumes(omnipoolAssetsIds, withoutRefresh)

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
    ...volumes,
    ...spotPrices,
  ]

  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !omnipoolAssets.data ||
      !apiIds.data ||
      !assetMetas.data ||
      volumes.some((q) => !q.data) ||
      spotPrices.some((q) => !q.data)
    )
      return []

    // TODO: rework it to first pull all trades, sort it, filter it, select first N elements and only then calculate values
    const allTrades = volumes
      .reduce(
        (memo, volume) => {
          volume.data?.events.forEach((event) => {
            if (
              (event.name === "Omnipool.BuyExecuted" ||
                event.name === "Omnipool.SellExecuted") &&
              !memo.find((trade) => trade.id === event.id)
            ) {
              const isBuy = event.name === "Omnipool.BuyExecuted"

              const assetIn = event.args.assetIn.toString()
              const amountInRaw = new BN(event.args.amountIn)
              const assetOut = event.args.assetOut.toString()
              const amountOutRaw = new BN(event.args.amountOut)
              const timeStamp = event.block.timestamp

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
                .plus(
                  amountOut.multipliedBy(spotPriceOut?.data?.spotPrice ?? 1),
                )

              memo.push({
                ...event,
                isBuy,
                isSell: !isBuy,
                amountIn,
                amountOut,
                assetInSymbol: assetMetaIn?.symbol ?? "",
                assetOutSymbol: assetMetaOut?.symbol ?? "",
                totalValue,
                account: event.args.who,
                date: new Date(event.block.timestamp),
              })
            }
          })
          return memo
        },

        [] as Array<
          TradeType & {
            isBuy: boolean
            isSell: boolean
            amountIn: BN
            amountOut: BN
            totalValue: BN
            account: string
            assetInSymbol: string
            assetOutSymbol: string
            date: Date
          }
        >,
      )
      .sort(
        (a, b) =>
          new Date(b.block.timestamp).getTime() -
          new Date(a.block.timestamp).getTime(),
      )
      .slice(0, 10)
    return allTrades
  }, [apiIds.data, assetMetas.data, omnipoolAssets.data, spotPrices, volumes])

  return { data, isLoading: isInitialLoading }
}

export type TRecentTradesTable = typeof useRecentTradesTableData
export type TRecentTradesTableData = ReturnType<TRecentTradesTable>["data"]
