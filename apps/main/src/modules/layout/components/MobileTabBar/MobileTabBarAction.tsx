import { Text } from "@galacticcouncil/ui/components"
import { getToken, px } from "@galacticcouncil/ui/utils"
import { ReactNode } from "@tanstack/react-router"
import { FC } from "react"

import { STabBarMenuAction } from "@/modules/layout/components/MobileTabBar/MobileTabBar.styled"

type Props = {
  readonly icon: ReactNode
  readonly label: ReactNode
  readonly onClick?: () => void
}

export const MobileTabBarAction: FC<Props> = ({ icon, label, onClick }) => {
  return (
    <STabBarMenuAction onClick={onClick}>
      {icon}
      <Text fw={600} fs={13} lh={px(18)} color={getToken("text.high")}>
        {label}
      </Text>
    </STabBarMenuAction>
  )
}
