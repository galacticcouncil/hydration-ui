import { Flex } from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"
import { FC, ReactNode } from "react"

import { SubpageMenu } from "@/modules/layout/components/SubpageMenu"

type Props = {
  readonly actions?: ReactNode
}

export const SubpageLayout: FC<Props> = ({ actions }) => {
  return (
    <Flex direction="column" gap={20}>
      <Flex justify="space-between" align="center">
        <SubpageMenu />
        {actions}
      </Flex>
      <Outlet />
    </Flex>
  )
}
