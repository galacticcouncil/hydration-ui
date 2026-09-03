import { marketTradesQuery } from "@galacticcouncil/indexer/neckwork"
import { safeConvertPublicKeyToSS58 } from "@galacticcouncil/utils"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { neckworkClient } from "@/api/neckwork"
import { getSwapExplorerLink } from "@/modules/trade/orders/lib/getSwapExplorerLink"
import { MarketSwapStatus, SwapData } from "@/modules/trade/orders/lib/types"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

const MARKET_STATUS: MarketSwapStatus = { kind: "market", status: "filled" }

export const useMarketTradesData = (
  assetIds: Array<string>,
  page: number,
  pageSize: number,
) => {
  const { data, isLoading } = useQuery({
    ...marketTradesQuery(neckworkClient, {
      assetIds,
      limit: pageSize,
      offset: page * pageSize,
    }),
    placeholderData: keepPreviousData,
    refetchInterval: 30_000,
  })

  const { getAssetWithFallback } = useAssets()

  const totalCount = data?.totalCount ?? 0
  const swaps = useMemo<Array<SwapData>>(() => {
    return (
      data?.items.map<SwapData>((trade) => {
        const from = getAssetWithFallback(trade.assetIn)
        const to = getAssetWithFallback(trade.assetOut)
        const fromAmount = scaleHuman(trade.amountIn || "0", from.decimals)
        const toAmount = scaleHuman(trade.amountOut || "0", to.decimals)
        const fillPrice = Big(toAmount).gt(0)
          ? Big(fromAmount).div(toAmount).toString()
          : "0"

        const status = trade.dca
          ? ({ kind: "marketDca", scheduleId: trade.dca.scheduleId } as const)
          : MARKET_STATUS

        const link = getSwapExplorerLink(status, {
          paraBlockHeight: trade.blockHeight,
          indexInBlock: trade.eventIndex,
          extrinsicIndex: trade.extrinsicIndex,
        })

        return {
          from,
          fromAmount,
          to,
          toAmount,
          fillPrice,
          link,
          address: trade.swapper
            ? safeConvertPublicKeyToSS58(trade.swapper) || trade.swapper
            : null,
          date: new Date(trade.timestamp),
          status,
        }
      }) ?? []
    )
  }, [data, getAssetWithFallback])

  return { swaps, totalCount, isLoading }
}
