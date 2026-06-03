import {
  Paper,
  Separator,
  Stack,
  Toggle,
  ToggleLabel,
  ToggleRoot,
} from "@galacticcouncil/ui/components"
import { DataProviderStatus } from "@galacticcouncil/utils"
import { Outlet } from "@tanstack/react-router"
import { useState } from "react"

import { SquidIndexerStatus } from "@/components/DataProviderSelect/components/squid/SquidIndexerStatus"
import { useActiveIndexerStatus } from "@/components/DataProviderSelect/DataProviderSelect.utils"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid/TwoColumnGrid"
import { TradeOrders } from "@/modules/trade/orders/TradeOrders"
import { TradeOrdersHistory } from "@/modules/trade/orders/TradeOrdersHistory"
import { FormHeader } from "@/modules/trade/swap/components/FormHeader/FormHeader"
import { PageHeader } from "@/modules/trade/swap/components/PageHeader/PageHeader"
import { TradeChart } from "@/modules/trade/swap/components/TradeChart/TradeChart"
import { TradeChartGrafana } from "@/modules/trade/swap/components/TradeChartGrafana/TradeChartGrafana"

import { SSwapFormContainer } from "./SwapPage.styled"

export const TRADE_CHART_DESKTOP_HEIGHT = 460

export const SwapPageDesktop = () => {
  const { status } = useActiveIndexerStatus()
  const [legacyDataEnabled, setLegacyDataEnabled] = useState(false)

  const isIndexerDegraded =
    status === DataProviderStatus.DEGRADED ||
    status === DataProviderStatus.OFFLINE

  const isUsingLegacyData = isIndexerDegraded || legacyDataEnabled

  return (
    <Stack gap="xl">
      <PageHeader />
      <Paper p="xl" maxWidth="4xl">
        <ToggleRoot>
          <ToggleLabel>Legacy Data</ToggleLabel>
          <Toggle
            sx={{ ml: "auto" }}
            disabled={isIndexerDegraded}
            checked={isUsingLegacyData}
            onCheckedChange={setLegacyDataEnabled}
          />
        </ToggleRoot>
        <Separator my="l" />
        <SquidIndexerStatus sx={{ fontSize: "p5" }} />
      </Paper>
      <TwoColumnGrid template="sidebar">
        {isUsingLegacyData ? (
          <TradeChartGrafana height={TRADE_CHART_DESKTOP_HEIGHT} />
        ) : (
          <TradeChart height={TRADE_CHART_DESKTOP_HEIGHT} />
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
