import { Flex, Separator } from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"
import { FC } from "react"

import { TradeOrders } from "@/modules/trade/orders/TradeOrders"
import { FormHeader } from "@/modules/trade/swap/components/FormHeader/FormHeader"
import { LimitPostFormDisclaimer } from "@/modules/trade/swap/components/LimitPostFormDisclaimer"
import { TradeChart } from "@/modules/trade/swap/components/TradeChart/TradeChart"

import { SSwapFormContainer } from "./SwapPage.styled"

export const TRADE_CHART_MOBILE_HEIGHT = 300

export const SwapPageMobile: FC = () => {
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
