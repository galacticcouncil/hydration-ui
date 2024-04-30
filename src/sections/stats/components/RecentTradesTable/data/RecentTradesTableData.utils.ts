import { useApiIds } from "api/consts"
import { useSpotPrices } from "api/spotPrice"
import BN from "bignumber.js"
import { useMemo } from "react"
import { getFloatingPointAmount } from "utils/balance"
import { useDisplayAssetStore } from "utils/displayAsset"
import { useRpcProvider } from "providers/rpcProvider"
import { isHydraAddress } from "utils/formatting"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { HYDRA_ADDRESS_PREFIX } from "utils/api"
import { useAccountsIdentity } from "api/stats"
import { TradeType, useAllTrades } from "api/volume"
import { groupBy } from "utils/rx"
import { isNotNil } from "utils/helpers"
import { BN_NAN } from "utils/constants"

const withoutRefresh = true

const EVENTS_LIMIT = 10

export const useRecentTradesTableData = (assetId?: string) => {
  const { assets } = useRpcProvider()
  const apiIds = useApiIds()
  const allTrades = useAllTrades(assetId ? Number(assetId) : undefined)
  const displayAsset = useDisplayAssetStore()

  const address = allTrades.data?.events.map((event) => event.args.who) ?? []
  const identities = useAccountsIdentity(address)

  const events = useMemo(() => {
    if (!allTrades.data) return
    const groupedEvents = groupBy(
      allTrades.data.events,
      ({ extrinsic }) => extrinsic.hash,
    )

    return Object.entries(groupedEvents)
      .map(([, value]) => {
        // check if last event is Router event
        const routerEvent = value.find(({ name }) => name === "Router.Executed")
        const [firstEvent] = value

        if (firstEvent?.name === "Router.Executed") return null

        let event: TradeType
        if (!routerEvent) {
          const lastEvent = value[value.length - 1]
          event = {
            ...firstEvent,
            args: {
              who: firstEvent.args.who,
              assetIn: firstEvent.args.assetIn,
              assetOut: lastEvent.args.assetOut,
              amountIn: firstEvent.args.amount || firstEvent.args.amountIn,
              amountOut: lastEvent.args.amount || lastEvent.args.amountOut,
            },
          }
        } else {
          event = {
            ...firstEvent,
            args: {
              ...firstEvent.args,
              ...routerEvent.args,
            },
          }
        }

        const assetInMeta = assets.getAsset(event.args.assetIn.toString())
        const assetOutMeta = assets.getAsset(event.args.assetOut.toString())

        if (!assetInMeta?.name || !assetOutMeta?.name) return null

        return event
      })
      .filter(isNotNil)
      .slice(0, EVENTS_LIMIT)
  }, [allTrades.data, assets])

  const assetIds = events
    ? events?.map(({ args }) => args.assetIn.toString())
    : []

  const spotPrices = useSpotPrices(
    assetIds,
    displayAsset.stableCoinId,
    withoutRefresh,
  )

  const queries = [apiIds, allTrades, ...spotPrices, ...identities]

  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (!events || !apiIds.data || spotPrices.some((q) => !q.data)) return []

    const trades = events.reduce(
      (memo, trade) => {
        const isSelectedAsset = assetId
          ? assetId === trade.args.assetIn.toString() ||
            assetId === trade.args.assetOut.toString()
          : true

        if (
          isSelectedAsset &&
          !memo.find((memoTrade) => memoTrade.id === trade.id)
        ) {
          const isBuy =
            trade.name === "Omnipool.BuyExecuted" ||
            trade.name === "XYK.BuyExecuted"

          const assetIn = trade.args.assetIn.toString()
          const amountInRaw = new BN(trade.args.amountIn)
          const assetOut = trade.args.assetOut.toString()
          const amountOutRaw = new BN(trade.args.amountOut)

          const assetMetaIn = assets.getAsset(assetIn)
          const assetMetaOut = assets.getAsset(assetOut)

          const spotPriceIn = spotPrices.find(
            (spotPrice) => spotPrice?.data?.tokenIn === assetIn,
          )?.data

          const amountIn = getFloatingPointAmount(
            amountInRaw,
            assetMetaIn.decimals,
          )
          const amountOut = getFloatingPointAmount(
            amountOutRaw,
            assetMetaOut.decimals,
          )

          const tradeValue = amountIn.multipliedBy(
            spotPriceIn?.spotPrice ?? BN_NAN,
          )

          const hydraAddress = isHydraAddress(trade.args.who)
            ? trade.args.who
            : encodeAddress(decodeAddress(trade.args.who), HYDRA_ADDRESS_PREFIX)

          const identity = identities.find(
            (identity) => identity.data?.address === trade.args.who,
          )?.data?.identity

          const account = identity ?? hydraAddress

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
              tradeValue,
              account,
              date: new Date(trade.block.timestamp),
              extrinsicHash: trade.extrinsic?.hash,
              isIdentity: !!identity,
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
        tradeValue: BN
        account: string
        assetInSymbol: string
        assetOutSymbol: string
        date: Date
        assetInId: string
        assetOutId: string
        extrinsicHash: string
        isIdentity: boolean
      }>,
    )

    return trades
  }, [events, apiIds.data, spotPrices, assetId, assets, identities])

  return { data, isLoading: isInitialLoading }
}

export type TRecentTradesTable = typeof useRecentTradesTableData
export type TRecentTradesTableData = ReturnType<TRecentTradesTable>["data"]
