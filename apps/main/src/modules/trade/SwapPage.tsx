import { Flex, Paper, Separator } from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"

import { FormHeader } from "./components"
import { SContainer } from "./SwapPage.styled"

export const SwapPage = () => {
  return (
    <Flex gap={20} sx={{ flexWrap: "wrap" }} justify="center">
      <Paper sx={{ height: 700, minWidth: ["auto", 640] }}></Paper>

      <Flex direction="column" gap={20} sx={{ width: ["100%", 440] }}>
        <SContainer>
          <FormHeader />
          <Separator mx={-20} />
          <Outlet />
        </SContainer>
        <Paper sx={{ height: 50 }}></Paper>
      </Flex>
    </Flex>
  )
}
