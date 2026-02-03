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
      {IconComponent && (
        <Icon
          size="m"
          component={IconComponent}
          color={getToken("icons.onContainer")}
        />
      )}
      <Box>
        <Text fw={600} fs="p4" lh={1.4}>
          {title}
        </Text>
        {description && (
          <Text fs="p5" lh={1.25} color={getToken("text.low")}>
            {description}
          </Text>
        )}
      </Box>
      <Icon
        size="m"
        component={ArrowRight}
        ml="auto"
        color={getToken("icons.onSurface")}
      />
    </Link>
  </SDetailedLink>
)
