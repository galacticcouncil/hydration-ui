import { PaperProps } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { TradeOrders } from "@/modules/trade/orders/TradeOrders/TradeOrders"
import { TradeOrdersHistory } from "@/modules/trade/orders/TradeOrdersHistory"
import { TradeChart } from "@/modules/trade/swap/components/TradeChart/TradeChart"
import { TradeChartGrafana } from "@/modules/trade/swap/components/TradeChartGrafana/TradeChartGrafana"
import { useNeckworkEnabled } from "@/states/neckwork"

export const useTradeDataSource = (): "neckwork" | "legacy" =>
  useNeckworkEnabled() ? "neckwork" : "legacy"

export const TRADE_CHART_BY_SOURCE = {
  neckwork: TradeChart,
  legacy: TradeChartGrafana,
} as const satisfies Record<string, FC<{ readonly height: number }>>

export const TRADE_ORDERS_BY_SOURCE = {
  neckwork: TradeOrders,
  legacy: TradeOrdersHistory,
} as const satisfies Record<string, FC<PaperProps>>
