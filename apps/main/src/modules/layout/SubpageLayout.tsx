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
    <Flex direction="column" gap={20}>
      <Flex justify="space-between" align="center">
        {subpageMenu ?? <SubpageMenu />}
        {actions}
      </Flex>
      <Outlet />
    </Flex>
  )
}
