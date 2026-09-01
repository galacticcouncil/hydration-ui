import { PaperProps } from "@galacticcouncil/ui/components"
import { DataProviderStatus } from "@galacticcouncil/utils"
import { FC } from "react"

import { useActiveIndexerStatus } from "@/components/DataProviderSelect/DataProviderSelect.utils"
import { TradeOrders } from "@/modules/trade/orders/TradeOrders"
import { TradeOrdersHistory } from "@/modules/trade/orders/TradeOrdersHistory"
import { TradeOrdersNeckwork } from "@/modules/trade/orders/TradeOrdersNeckwork/TradeOrdersNeckwork"
import { TradeChart } from "@/modules/trade/swap/components/TradeChart/TradeChart"
import { TradeChartGrafana } from "@/modules/trade/swap/components/TradeChartGrafana/TradeChartGrafana"
import { TradeChartNeckwork } from "@/modules/trade/swap/components/TradeChartNeckwork/TradeChartNeckwork"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useNeckworkEnabled } from "@/states/neckwork"

export const useNeckworkTradeQueriesEnabled = (): boolean => {
  const isNeckworkEnabled = useNeckworkEnabled()
  const { isFork } = useRpcProvider()

  return isNeckworkEnabled && !isFork
}

export const useTradeDataSource = (): "neckwork" | "legacy" | "squid" => {
  const isNeckworkEnabled = useNeckworkEnabled()
  const { status } = useActiveIndexerStatus()

  if (isNeckworkEnabled) return "neckwork"

  return status === DataProviderStatus.DEGRADED ||
    status === DataProviderStatus.OFFLINE
    ? "legacy"
    : "squid"
}

export const TRADE_CHART_BY_SOURCE = {
  neckwork: TradeChartNeckwork,
  legacy: TradeChartGrafana,
  squid: TradeChart,
} as const satisfies Record<string, FC<{ readonly height: number }>>

export const TRADE_ORDERS_BY_SOURCE = {
  neckwork: TradeOrdersNeckwork,
  legacy: TradeOrdersHistory,
  squid: TradeOrders,
} as const satisfies Record<string, FC<PaperProps>>
