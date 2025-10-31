import { Flex, Grid, Separator, Stack } from "@galacticcouncil/ui/components"
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
      <Grid columnTemplate="3fr 2fr" columnGap={20} align="start">
        <Flex direction="column" gap={20}>
          <TradeChart height={500} />
          <TradeOrders />
        </Flex>
        <SSwapFormContainer>
          <FormHeader />
          <Separator mx={-20} />
          <Outlet />
        </SSwapFormContainer>
      </Grid>
    </Stack>
  )
}
