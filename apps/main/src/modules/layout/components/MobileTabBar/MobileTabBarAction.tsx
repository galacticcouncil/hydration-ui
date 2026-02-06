import { ExternalLink, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"

import { STabBarMenuAction } from "@/modules/layout/components/MobileTabBar/MobileTabBar.styled"

type Props = {
  readonly icon: React.ComponentType
  readonly label: ReactNode
  readonly link?: string
  readonly onClick?: () => void
}

export const MobileTabBarAction: FC<Props> = ({
  icon,
  label,
  link,
  onClick,
}) => {
  const renderLink = (children: ReactNode) =>
    link ? (
      <ExternalLink sx={{ textDecoration: "none" }} href={link}>
        {children}
      </ExternalLink>
    ) : (
      children
    )

  return renderLink(
    <STabBarMenuAction onClick={onClick}>
      <Icon component={icon} />
      <Text fw={600} fs="p4" lh="m" color={getToken("text.high")}>
        {label}
      </Text>
    </STabBarMenuAction>,
  )
}
