import { Flex, Separator } from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"
import { FC } from "react"

import { TradeOrders } from "@/modules/trade/orders/TradeOrders"
import { TradeOrdersHistory } from "@/modules/trade/orders/TradeOrdersHistory"
import { FormHeader } from "@/modules/trade/swap/components/FormHeader/FormHeader"
import { TradeChart } from "@/modules/trade/swap/components/TradeChart/TradeChart"
import { TradeChartGrafana } from "@/modules/trade/swap/components/TradeChartGrafana/TradeChartGrafana"

import { SSwapFormContainer } from "./SwapPage.styled"

export const TRADE_CHART_MOBILE_HEIGHT = 300

export const SwapPageMobile: FC = () => {
  return (
    <Flex direction="column" gap="xxl">
      <SSwapFormContainer>
        <FormHeader />
        <Separator mx={-20} />
        <Outlet />
      </SSwapFormContainer>
      <TradeChartGrafana height={TRADE_CHART_MOBILE_HEIGHT} />
      <TradeChart height={TRADE_CHART_MOBILE_HEIGHT} />
      <TradeOrdersHistory />
      <TradeOrders />
    </Flex>
  )
}
