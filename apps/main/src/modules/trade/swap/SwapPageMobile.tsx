import { Flex, Separator } from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"
import { FC } from "react"

import { FormHeader } from "@/modules/trade/swap/components/FormHeader/FormHeader"
import { LimitPostFormDisclaimer } from "@/modules/trade/swap/components/LimitPostFormDisclaimer"
import {
  TRADE_CHART_BY_SOURCE,
  TRADE_ORDERS_BY_SOURCE,
  useTradeDataSource,
} from "@/modules/trade/swap/tradeDataSource"

import { SSwapFormContainer } from "./SwapPage.styled"

export const TRADE_CHART_MOBILE_HEIGHT = 300

export const SwapPageMobile: FC = () => {
  const source = useTradeDataSource()
  const TradeChart = TRADE_CHART_BY_SOURCE[source]
  const TradeOrders = TRADE_ORDERS_BY_SOURCE[source]

  return (
    <Flex direction="column" gap="xxl">
      <Flex direction="column" gap="base" width="100%">
        <SSwapFormContainer width="100%">
          <FormHeader />
          <Separator mx={-20} />
          <Outlet />
        </SSwapFormContainer>
        <LimitPostFormDisclaimer />
      </Flex>
      <TradeChart height={TRADE_CHART_MOBILE_HEIGHT} />
      <TradeOrders />
    </Flex>
  )
}
