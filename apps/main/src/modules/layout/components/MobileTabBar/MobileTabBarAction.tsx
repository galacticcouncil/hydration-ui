import { Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"

import { STabBarMenuAction } from "@/modules/layout/components/MobileTabBar/MobileTabBar.styled"

type Props = {
  readonly icon: React.ComponentType
  readonly label: ReactNode
  readonly onClick?: () => void
}

export const MobileTabBarAction: FC<Props> = ({ icon, label, onClick }) => {
  return (
    <STabBarMenuAction onClick={onClick}>
      <Icon component={icon} />
      <Text fw={600} fs="p4" lh="m" color={getToken("text.high")}>
        {label}
      </Text>
    </STabBarMenuAction>
  )
}
