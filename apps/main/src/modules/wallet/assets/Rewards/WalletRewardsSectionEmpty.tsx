import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { FC, ReactNode } from "react"

import { FileRouteTypes } from "@/routeTree.gen"

type Props = {
  readonly link: FileRouteTypes["to"]
  readonly children: ReactNode
}

export const WalletRewardsSectionEmpty: FC<Props> = ({ link, children }) => {
  return (
    <Flex align="center">
      <Text
        fw={500}
        fs={12}
        lh={px(15)}
        sx={{ color: getToken("text.medium"), textDecoration: "none" }}
        asChild
      >
        <Link to={link}>{children}</Link>
      </Text>
      <Icon component={ChevronRight} size={10} />
    </Flex>
  )
}
