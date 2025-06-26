import {
  OhlcData,
  toUTCTimestamp,
} from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { bestNumberQuery } from "@/api/chain"
import { tradePricesQuery } from "@/api/graphql/trade-prices"
import { useSquidClient } from "@/api/provider"
import { PeriodType } from "@/components/PeriodInput/PeriodInput"
import { PERIOD_MS } from "@/components/PeriodInput/PeriodInput.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { PARACHAIN_BLOCK_TIME } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

type Args = {
  readonly assetInId: string
  readonly assetOutId: string
  readonly period: PeriodType | null
}

export const useTradeChartData = ({ assetInId, assetOutId, period }: Args) => {
  const rpc = useRpcProvider()
  const squidClient = useSquidClient()

  const { getAsset } = useAssets()
  const assetOut = getAsset(assetOutId)

  const { data: blockNumberData } = useQuery(bestNumberQuery(rpc))

  const currentBlock = blockNumberData?.parachainBlockNumber ?? 0
  const startingBlock = useMemo(
    () =>
      period
        ? Math.max(0, currentBlock - PERIOD_MS[period] / PARACHAIN_BLOCK_TIME)
        : 0,
    // only refetch on period change
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [period, currentBlock === 0],
  )

  const { data, isError, isLoading, isSuccess } = useQuery(
    tradePricesQuery(squidClient, assetInId, assetOutId, startingBlock),
  )

  const prices = useMemo(() => {
    if (isLoading || !assetOut) {
      return []
    }

    return (
      data?.assetSpotPriceHistoricalData?.edges.map<OhlcData>((edge) => ({
        time: toUTCTimestamp(
          new Date(edge.node?.block?.timestamp ?? 0).valueOf(),
        ),
        close: Number(scaleHuman(edge.node?.price ?? 0, assetOut.decimals)),
      })) ?? []
    )
  }, [data, assetOut, isLoading])

  return {
    prices,
    isError,
    isLoading,
    isSuccess,
  }
}
