import { Box, Grid, Separator, Stack } from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"

import { TradeOrders } from "@/modules/trade/orders/TradeOrders"
import { FormHeader } from "@/modules/trade/swap/components/FormHeader/FormHeader"
import { PageHeader } from "@/modules/trade/swap/components/PageHeader/PageHeader"
import { TradeChart } from "@/modules/trade/swap/components/TradeChart/TradeChart"

import { SContainer } from "./SwapPage.styled"

export const SwapPage = () => {
  return (
    <Stack gap={20}>
      <PageHeader />
      <Grid columnTemplate={["1fr", null, null, "3fr 2fr"]} gap={20}>
        <Box display={["none", null, null, "block"]}>
          <TradeChart height={500} />
        </Box>
        <SContainer>
          <FormHeader />
          <Separator mx={-20} />
          <Outlet />
        </SContainer>
        <TradeOrders />
      </Grid>
    </Stack>
  )
}
