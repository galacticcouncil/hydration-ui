import { Flex, Separator, Stack } from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"

import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid/TwoColumnGrid"
import { TradeOrders } from "@/modules/trade/orders/TradeOrders/TradeOrders"
import { FormHeader } from "@/modules/trade/swap/components/FormHeader/FormHeader"
import { PageHeader } from "@/modules/trade/swap/components/PageHeader/PageHeader"
import { SwapChart } from "@/modules/trade/swap/components/SwapChart/SwapChart"

import { SSwapFormContainer } from "./SwapPage.styled"

export const TRADE_CHART_DESKTOP_HEIGHT = 460

export const SwapPageDesktop = () => {
  return (
    <Stack gap="xl">
      <PageHeader />
      <TwoColumnGrid template="sidebar" sx={{ gridTemplateRows: "auto 1fr" }}>
        <SwapChart height={TRADE_CHART_DESKTOP_HEIGHT} />
        <Flex
          direction="column"
          gap="base"
          width="100%"
          minWidth={0}
          gridColumn={2}
          gridRow={[null, null, null, "1/-1"]}
          sx={{ alignSelf: "stretch" }}
        >
          <SSwapFormContainer width="100%">
            <FormHeader />
            <Separator mx="-xl" />
            <Outlet />
          </SSwapFormContainer>
        </Flex>
        <TradeOrders gridColumn={[null, null, "1/-1", "1"]} />
      </TwoColumnGrid>
    </Stack>
  )
}
