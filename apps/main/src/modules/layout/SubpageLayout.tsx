import { Box, Flex, Grid, Separator } from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"
import { FC, ReactNode } from "react"

import { SubpageMenu } from "@/modules/layout/components/SubpageMenu"

type Props = {
  readonly actions?: ReactNode
  readonly subpageMenu?: ReactNode
  readonly ignoreCurrentSearch?: boolean
}

export const SubpageLayout: FC<Props> = ({
  actions,
  subpageMenu,
  ignoreCurrentSearch,
}) => {
  return (
    <Flex direction="column" py={8}>
      <Grid columnTemplate="1fr auto" align="center">
        {subpageMenu ?? (
          <SubpageMenu ignoreCurrentSearch={ignoreCurrentSearch} />
        )}
        <Box sx={{ gridColumn: 2 }}>{actions}</Box>
      </Grid>
      <Separator mt={8} mb={20} mx={-30} />
      <Outlet />
    </Flex>
  )
}
