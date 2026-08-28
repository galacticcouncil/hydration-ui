import { PaperProps } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { TradeOrdersHistory } from "@/modules/trade/orders/TradeOrdersHistory"
import { TradeOrdersNeckwork } from "@/modules/trade/orders/TradeOrdersNeckwork/TradeOrdersNeckwork"
import { SwapChart } from "@/modules/trade/swap/components/SwapChart/SwapChart"
import { TradeChartGrafana } from "@/modules/trade/swap/components/TradeChartGrafana/TradeChartGrafana"
import { useNeckworkEnabled } from "@/states/neckwork"

export const useTradeDataSource = (): "neckwork" | "legacy" =>
  useNeckworkEnabled() ? "neckwork" : "legacy"

export const TRADE_CHART_BY_SOURCE = {
  neckwork: SwapChart,
  legacy: TradeChartGrafana,
} as const satisfies Record<string, FC<{ readonly height: number }>>

export const TRADE_ORDERS_BY_SOURCE = {
  neckwork: TradeOrdersNeckwork,
  legacy: TradeOrdersHistory,
} as const satisfies Record<string, FC<PaperProps>>
