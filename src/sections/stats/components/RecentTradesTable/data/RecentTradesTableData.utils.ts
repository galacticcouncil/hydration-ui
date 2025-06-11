import BN from "bignumber.js"
import { useMemo } from "react"
import { getFloatingPointAmount } from "utils/balance"
import { isHydraAddress, safeConvertAddressSS58 } from "utils/formatting"
import { useAccountsIdentity } from "api/stats"
import { TradeType, useAllTrades } from "api/volume"

import { useAssets } from "providers/assets"
import { useAssetsPrice } from "state/displayPrice"

const EVENTS_LIMIT = 10

export const useRecentTradesTableData = (assetId?: string) => {
  const { getAsset, getAssetWithFallback } = useAssets()
  const { data: allTrades = [], isLoading: isLoadigTrades } = useAllTrades(
    assetId ? Number(assetId) : undefined,
  )

  const trades = useMemo(
    () =>
      allTrades
        .reduce<TradeType[]>((memo, trade) => {
          if (trade) {
            const isSelectedAsset = assetId
              ? assetId === trade.args.assetIn.toString() ||
                assetId === trade.args.assetOut.toString()
              : true

            if (
              isSelectedAsset &&
              !memo.find((memoTrade) => memoTrade.id === trade.id)
            ) {
              const assetInMeta = getAsset(trade.args.assetIn.toString())
              const assetOutMeta = getAsset(trade.args.assetOut.toString())

              if (assetInMeta?.name && assetOutMeta?.name) {
                memo.push(trade)
              }
            }
          }

          return memo
        }, [])
        .slice(0, EVENTS_LIMIT),
    [allTrades, assetId, getAsset],
  )

  const assetIds = trades.map(({ args }) => args.assetIn.toString())
  const { getAssetPrice, isLoading: isPriceLaoding } = useAssetsPrice(assetIds)
  const identities = useAccountsIdentity(trades.map((trade) => trade.args.who))

  const data = useMemo(
    () =>
      trades.map((trade) => {
        const isBuy =
          trade.name === "Omnipool.BuyExecuted" ||
          trade.name === "XYK.BuyExecuted"

        const assetIn = trade.args.assetIn.toString()
        const amountInRaw = new BN(trade.args.amountIn)
        const assetOut = trade.args.assetOut.toString()
        const amountOutRaw = new BN(trade.args.amountOut)

        const assetMetaIn = getAssetWithFallback(assetIn)
        const assetMetaOut = getAssetWithFallback(assetOut)

        const spotPriceIn = getAssetPrice(assetIn).price

        const amountIn = getFloatingPointAmount(
          amountInRaw,
          assetMetaIn?.decimals ?? 12,
        )
        const amountOut = getFloatingPointAmount(
          amountOutRaw,
          assetMetaOut?.decimals ?? 12,
        )

        const tradeValue = amountIn.multipliedBy(spotPriceIn)

        const hydraAddress = isHydraAddress(trade.args.who)
          ? trade.args.who
          : safeConvertAddressSS58(trade.args.who)

        const identity = identities.find(
          (identity) => identity.data?.address === trade.args.who,
        )?.data?.identity

        const account = identity ?? hydraAddress

        return {
          id: trade.id,
          isBuy,
          isSell: !isBuy,
          amountIn,
          amountOut,
          assetInSymbol: assetMetaIn.symbol,
          assetOutSymbol: assetMetaOut?.symbol,
          assetInId: assetMetaIn.id,
          assetOutId: assetMetaOut.id,
          tradeValue,
          account,
          date: new Date(trade.block.timestamp),
          extrinsicHash: trade.extrinsic?.hash,
          isIdentity: !!identity,
        }
      }),
    [getAssetPrice, getAssetWithFallback, identities, trades],
  )

  const isLoading = isLoadigTrades || isPriceLaoding

  return { data, isLoading }
}

export type TRecentTradesTable = typeof useRecentTradesTableData
export type TRecentTradesTableData = ReturnType<TRecentTradesTable>["data"]
