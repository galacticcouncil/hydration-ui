import { Grid, Separator, Stack } from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"

import { TradeOrders } from "@/modules/trade/orders/TradeOrders"
import { FormHeader } from "@/modules/trade/swap/components/FormHeader/FormHeader"
import { PageHeader } from "@/modules/trade/swap/components/PageHeader/PageHeader"
import { TradeChart } from "@/modules/trade/swap/components/TradeChart/TradeChart"

import { SSwapFormContainer } from "./SwapPage.styled"

export const SwapPageDesktop = () => {
  return (
    <Stack gap="xl">
      <PageHeader />
      <Grid
        columnTemplate={[
          null,
          null,
          "minmax(24rem, 1fr) minmax(0, 25rem)",
          "minmax(30rem, 1fr) minmax(0, 27rem)",
        ]}
        rowTemplate="auto auto"
        gap="xl"
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
