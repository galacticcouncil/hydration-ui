import { Separator, Stack } from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"

import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid/TwoColumnGrid"
import { TradeOrders } from "@/modules/trade/orders/TradeOrders"
import { FormHeader } from "@/modules/trade/swap/components/FormHeader/FormHeader"
import { PageHeader } from "@/modules/trade/swap/components/PageHeader/PageHeader"
import { TradeChart } from "@/modules/trade/swap/components/TradeChart/TradeChart"

import { SSwapFormContainer } from "./SwapPage.styled"

export const TRADE_CHART_DESKTOP_HEIGHT = 460

export const SwapPageDesktop = () => {
  return (
    <Stack gap="xl">
      <PageHeader />
      <TwoColumnGrid template="sidebar">
        <TradeChart height={TRADE_CHART_DESKTOP_HEIGHT} />
        <SSwapFormContainer gridColumn={2} gridRow={[null, null, null, "1/-1"]}>
          <FormHeader />
          <Separator mx={-20} />
          <Outlet />
        </SSwapFormContainer>
        <TradeOrders gridColumn={[null, null, "1/-1", "1"]} />
      </TwoColumnGrid>
    </Stack>
  )
}
