import { useApiIds } from "api/consts"
import { useOmnipoolAssets } from "api/omnipool"
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
import { useAllTrades } from "api/volume"

const withoutRefresh = true

export const useRecentTradesTableData = (assetId?: string) => {
  const { assets } = useRpcProvider()
  const omnipoolAssets = useOmnipoolAssets(withoutRefresh)
  const apiIds = useApiIds()
  const allTrades = useAllTrades(assetId ? Number(assetId) : undefined)
  const displayAsset = useDisplayAssetStore()
  const omnipoolAssetsIds = omnipoolAssets.data?.map((a) => a.id) ?? []

  const address = allTrades.data?.events.map((event) => event.args.who) ?? []
  const identities = useAccountsIdentity(address)

  const spotPrices = useSpotPrices(
    omnipoolAssetsIds,
    displayAsset.stableCoinId,
    withoutRefresh,
  )

  const queries = [
    omnipoolAssets,
    apiIds,
    allTrades,
    ...spotPrices,
    ...identities,
  ]

  const isInitialLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !allTrades.data ||
      !omnipoolAssets.data ||
      !apiIds.data ||
      spotPrices.some((q) => !q.data)
    )
      return []

    const trades = allTrades.data.events.reduce(
      (memo, trade) => {
        const isSelectedAsset = assetId
          ? assetId === trade.args.assetIn.toString() ||
            assetId === trade.args.assetOut.toString()
          : true

        if (
          isSelectedAsset &&
          !memo.find((memoTrade) => memoTrade.id === trade.id)
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

          const amountIn = getFloatingPointAmount(
            amountInRaw,
            assetMetaIn.decimals,
          )
          const amountOut = getFloatingPointAmount(
            amountOutRaw,
            assetMetaOut.decimals,
          )

          const tradeValue = amountIn.multipliedBy(spotPriceIn?.spotPrice ?? 1)

          const hydraAddress = isHydraAddress(trade.args.who)
            ? trade.args.who
            : encodeAddress(decodeAddress(trade.args.who), HYDRA_ADDRESS_PREFIX)

          const identity = identities
            .find((identity) => identity.data?.address === trade.args.who)
            ?.data?.identity?.info.display.asRaw.toUtf8()

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
  }, [
    allTrades.data,
    omnipoolAssets.data,
    apiIds.data,
    spotPrices,
    assetId,
    assets,
    identities,
  ])

  return { data, isLoading: isInitialLoading }
}

export type TRecentTradesTable = typeof useRecentTradesTableData
export type TRecentTradesTableData = ReturnType<TRecentTradesTable>["data"]
