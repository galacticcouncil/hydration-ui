import { Flex } from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"
import { FC, ReactNode } from "react"

import { SubpageMenu } from "@/modules/layout/components/SubpageMenu"

type Props = {
  readonly actions?: ReactNode
  subpageMenu?: ReactNode
}

export const SubpageLayout: FC<Props> = ({ actions, subpageMenu }) => {
  return (
    <Flex direction="column">
      <Flex justify="space-between" align="center" sx={{ py: 8 }}>
        {subpageMenu ?? <SubpageMenu />}
        {actions}
      </Flex>
      <Outlet />
    </Flex>
  )
}
