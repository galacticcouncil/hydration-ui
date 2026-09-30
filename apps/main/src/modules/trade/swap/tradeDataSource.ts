import { PaperProps } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { TradeOrders } from "@/modules/trade/orders/TradeOrders/TradeOrders"
import { TradeOrdersHistory } from "@/modules/trade/orders/TradeOrdersHistory"
import { SwapChart } from "@/modules/trade/swap/components/SwapChart/SwapChart"
import { TradeChartGrafana } from "@/modules/trade/swap/components/TradeChartGrafana/TradeChartGrafana"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useNeckworkEnabled } from "@/states/neckwork"

export const useNeckworkTradeQueriesEnabled = (): boolean => {
  const isNeckworkEnabled = useNeckworkEnabled()
  const { isFork } = useRpcProvider()

  return isNeckworkEnabled && !isFork
}

export const useTradeDataSource = (): "neckwork" | "legacy" => {
  const neckworkEnabled = useNeckworkTradeQueriesEnabled()

  return neckworkEnabled ? "neckwork" : "legacy"
}

/**
 * Identical to `useTradeDataSource` today, and deliberately NOT collapsed into
 * it: the chart switch and the orders switch are separate decisions and have
 * already diverged once (ICE used to force the orders tabs to legacy while the
 * chart stayed on neckwork).
 *
 * Fork -> legacy, neckwork dead -> legacy, otherwise neckwork.
 * `useNeckworkTradeQueriesEnabled` already excludes `isFork`.
 */
export const useTradeOrdersDataSource = (): "neckwork" | "legacy" => {
  const neckworkEnabled = useNeckworkTradeQueriesEnabled()

  return neckworkEnabled ? "neckwork" : "legacy"
}

export const TRADE_CHART_BY_SOURCE = {
  neckwork: SwapChart,
  legacy: TradeChartGrafana,
} as const satisfies Record<string, FC<{ readonly height: number }>>

export const TRADE_ORDERS_BY_SOURCE = {
  neckwork: TradeOrders,
  legacy: TradeOrdersHistory,
} as const satisfies Record<string, FC<PaperProps>>
