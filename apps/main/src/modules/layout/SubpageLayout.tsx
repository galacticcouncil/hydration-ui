import { Flex } from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"

import { SubpageMenu } from "@/modules/layout/components/SubpageMenu"

export const SubpageLayout = () => {
  return (
    <Flex direction="column" gap={20}>
      <SubpageMenu />
      <Outlet />
    </Flex>
  )
}
