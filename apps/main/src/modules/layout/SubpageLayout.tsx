import { Flex } from "@galacticcouncil/ui/components"
import { Outlet } from "@tanstack/react-router"

import { SubpageMenu } from "@/modules/layout/components/SubpageMenu"

export const SUBPAGE_LAYOUT_ACTIONS_ELEMENT_ID = "subpage-layout-actions"

export const SubpageLayout = () => {
  return (
    <Flex direction="column" gap={20}>
      <Flex justify="space-between" align="center">
        <SubpageMenu />
        <div id={SUBPAGE_LAYOUT_ACTIONS_ELEMENT_ID} />
      </Flex>
      <Outlet />
    </Flex>
  )
}
