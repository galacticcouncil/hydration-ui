import { Flex, Grid, Paper, Separator } from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"

import { FormHeader } from "./components"
import { SContainer } from "./SwapPage.styled"

export const SwapPage = () => {
  return (
    <Grid
      sx={{
        gridTemplateColumns: ["1fr", "640px", "640px", "640px 440px"],
      }}
      gap={20}
    >
      <Paper sx={{ height: 700 }}></Paper>

      <Flex direction="column" gap={20}>
        <SContainer>
          <FormHeader />
          <Separator mx={-20} />
          <Outlet />
        </SContainer>
        <Paper sx={{ height: 50 }}></Paper>
      </Flex>
    </Grid>
  )
}
