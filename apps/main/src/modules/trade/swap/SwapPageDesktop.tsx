import { Grid, Separator, Stack } from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"

import { TradeOrders } from "@/modules/trade/orders/TradeOrders"
import { FormHeader } from "@/modules/trade/swap/components/FormHeader/FormHeader"
import { PageHeader } from "@/modules/trade/swap/components/PageHeader/PageHeader"
import { TradeChart } from "@/modules/trade/swap/components/TradeChart/TradeChart"

import { SSwapFormContainer } from "./SwapPage.styled"

export const SwapPageDesktop = () => {
  return (
    <Stack gap={20}>
      <PageHeader />
      <Grid
        columnTemplate={[
          null,
          null,
          "minmax(390px, 1fr) minmax(0, 400px)",
          "minmax(470px, 1fr) minmax(0, 440px)",
        ]}
        rowTemplate="auto auto"
        gap={20}
        align="start"
      >
        <TradeChart height={456} />
        <SSwapFormContainer gridColumn={2} gridRow={[null, null, null, "1/-1"]}>
          <FormHeader />
          <Separator mx={-20} />
          <Outlet />
        </SSwapFormContainer>
        <TradeOrders gridColumn={[null, null, "1/-1", "1"]} />
      </Grid>
    </Stack>
  )
}
