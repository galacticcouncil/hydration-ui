import { Flex, Grid, Paper, Separator } from "@galacticcouncil/ui/components"

import { Market } from "@/modules/trade/sections/Market"

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
          <Separator my={20} mx={-20} />
          <Market />
        </SContainer>
        <Paper sx={{ height: 50 }}></Paper>
      </Flex>
    </Grid>
  )
}
