import { Separator, Stack } from "@galacticcouncil/ui/components"
import { DataProviderStatus } from "@galacticcouncil/utils"
import { Outlet } from "@tanstack/react-router"

import { useActiveIndexerStatus } from "@/components/DataProviderSelect/DataProviderSelect.utils"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid/TwoColumnGrid"
import { TradeOrders } from "@/modules/trade/orders/TradeOrders"
import { TradeOrdersHistory } from "@/modules/trade/orders/TradeOrdersHistory"
import { FormHeader } from "@/modules/trade/swap/components/FormHeader/FormHeader"
import { PageHeader } from "@/modules/trade/swap/components/PageHeader/PageHeader"
import { SwapChart } from "@/modules/trade/swap/components/SwapChart/SwapChart"
import { TradeChartGrafana } from "@/modules/trade/swap/components/TradeChartGrafana/TradeChartGrafana"

import { SSwapFormContainer } from "./SwapPage.styled"

export const TRADE_CHART_DESKTOP_HEIGHT = 460

export const SwapPageDesktop = () => {
  const { status } = useActiveIndexerStatus()
  const isUsingLegacyData =
    status === DataProviderStatus.DEGRADED ||
    status === DataProviderStatus.OFFLINE

  return (
    <Stack gap="xl">
      <PageHeader />
      <TwoColumnGrid template="sidebar">
        {isUsingLegacyData ? (
          <TradeChartGrafana height={TRADE_CHART_DESKTOP_HEIGHT} />
        ) : (
          <SwapChart height={TRADE_CHART_DESKTOP_HEIGHT} />
        )}
        <SSwapFormContainer gridColumn={2} gridRow={[null, null, null, "1/-1"]}>
          <FormHeader />
          <Separator mx="-xl" />
          <Outlet />
        </SSwapFormContainer>
        {isUsingLegacyData ? (
          <TradeOrdersHistory gridColumn={[null, null, "1/-1", "1"]} />
        ) : (
          <TradeOrders gridColumn={[null, null, "1/-1", "1"]} />
        )}
      </TwoColumnGrid>
    </Stack>
  )
}
