import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import { Box, BoxProps, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Link, LinkProps } from "@tanstack/react-router"

import { NavigationKey } from "@/config/navigation"

import { SDetailedLink } from "./DetailedLink.styled"

type DetailedLinkOwnProps = {
  to: string | NavigationKey
  title: string
  description?: string
  icon?: React.ComponentType
  search?: Record<string, string | boolean>
}

export type DetailedLinkProps = BoxProps &
  DetailedLinkOwnProps &
  Omit<LinkProps, "to">

export const DetailedLink: React.FC<DetailedLinkProps> = ({
  to,
  title,
  description,
  icon: IconComponent,
  search,
  ...props
}) => (
  <SDetailedLink asChild {...props}>
    <Link to={to} search={search}>
      {IconComponent && <Icon size={20} component={IconComponent} />}
      <Box>
        <Text fw={600} fs={13}>
          {title}
        </Text>
        {description && (
          <Text fs={12} color={getToken("text.low")}>
            {description}
          </Text>
        )}
      </Box>
      <Icon size={20} component={ArrowRight} ml="auto" />
    </Link>
  </SDetailedLink>
)
