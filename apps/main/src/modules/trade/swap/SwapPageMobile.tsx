import { Flex, Separator } from "@galacticcouncil/ui/components"
import { DataProviderStatus } from "@galacticcouncil/utils"
import { Outlet } from "@tanstack/react-router"
import { FC } from "react"

import { useActiveIndexerStatus } from "@/components/DataProviderSelect/DataProviderSelect.utils"
import { TradeOrders } from "@/modules/trade/orders/TradeOrders"
import { TradeOrdersHistory } from "@/modules/trade/orders/TradeOrdersHistory"
import { TradeOrdersNeckwork } from "@/modules/trade/orders/TradeOrdersNeckwork/TradeOrdersNeckwork"
import { FormHeader } from "@/modules/trade/swap/components/FormHeader/FormHeader"
import { TradeChart } from "@/modules/trade/swap/components/TradeChart/TradeChart"
import { TradeChartGrafana } from "@/modules/trade/swap/components/TradeChartGrafana/TradeChartGrafana"
import { TradeChartNeckwork } from "@/modules/trade/swap/components/TradeChartNeckwork/TradeChartNeckwork"
import { useNeckworkEnabled } from "@/states/neckwork"

import { SSwapFormContainer } from "./SwapPage.styled"

export const TRADE_CHART_MOBILE_HEIGHT = 300

export const SwapPageMobile: FC = () => {
  const { status } = useActiveIndexerStatus()
  const isNeckworkEnabled = useNeckworkEnabled()

  const isUsingLegacyData =
    status === DataProviderStatus.DEGRADED ||
    status === DataProviderStatus.OFFLINE

  return (
    <Flex direction="column" gap="xxl">
      <SSwapFormContainer>
        <FormHeader />
        <Separator mx={-20} />
        <Outlet />
      </SSwapFormContainer>
      {isNeckworkEnabled ? (
        <TradeChartNeckwork height={TRADE_CHART_MOBILE_HEIGHT} />
      ) : isUsingLegacyData ? (
        <TradeChartGrafana height={TRADE_CHART_MOBILE_HEIGHT} />
      ) : (
        <TradeChart height={TRADE_CHART_MOBILE_HEIGHT} />
      )}
      {isNeckworkEnabled ? (
        <TradeOrdersNeckwork />
      ) : isUsingLegacyData ? (
        <TradeOrdersHistory />
      ) : (
        <TradeOrders />
      )}
    </Flex>
  )
}
