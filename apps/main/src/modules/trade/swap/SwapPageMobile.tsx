import { Flex, Separator } from "@galacticcouncil/ui/components"
import { DataProviderStatus } from "@galacticcouncil/utils"
import { Outlet } from "@tanstack/react-router"
import { FC } from "react"

import { useActiveIndexerStatus } from "@/components/DataProviderSelect/DataProviderSelect.utils"
import { TradeOrders } from "@/modules/trade/orders/TradeOrders"
import { TradeOrdersHistory } from "@/modules/trade/orders/TradeOrdersHistory"
import { FormHeader } from "@/modules/trade/swap/components/FormHeader/FormHeader"
import { SwapChart } from "@/modules/trade/swap/components/SwapChart/SwapChart"
import { TradeChartGrafana } from "@/modules/trade/swap/components/TradeChartGrafana/TradeChartGrafana"

import { SSwapFormContainer } from "./SwapPage.styled"

export const TRADE_CHART_MOBILE_HEIGHT = 300

export const SwapPageMobile: FC = () => {
  const { status } = useActiveIndexerStatus()

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
      {isUsingLegacyData ? (
        <TradeChartGrafana height={TRADE_CHART_MOBILE_HEIGHT} />
      ) : (
        <SwapChart height={TRADE_CHART_MOBILE_HEIGHT} />
      )}
      {isUsingLegacyData ? <TradeOrdersHistory /> : <TradeOrders />}
    </Flex>
  )
}
