import { Box, Grid, Separator } from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"

import { TradeOrders } from "@/modules/trade/orders/TradeOrders"
import { FormHeader } from "@/modules/trade/swap/components/FormHeader/FormHeader"
import { TradeChart } from "@/modules/trade/swap/components/TradeChart"

import { SContainer } from "./SwapPage.styled"

export const SwapPage = () => {
  return (
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
  )
}
