import { Box, Flex, Grid } from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"
import { FC, ReactNode } from "react"

import { SubpageMenu } from "@/modules/layout/components/SubpageMenu"

type Props = {
  readonly actions?: ReactNode
  readonly subpageMenu?: ReactNode
}

export const SubpageLayout: FC<Props> = ({ actions, subpageMenu }) => {
  return (
    <Flex direction="column" py={8}>
      <Grid columnTemplate="1fr auto" align="center" mb={20}>
        {subpageMenu ?? <SubpageMenu />}
        <Box sx={{ gridColumn: 2 }}>{actions}</Box>
      </Grid>
      <Outlet />
    </Flex>
  )
}
