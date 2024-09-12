import { Link, useSearch } from "@tanstack/react-location"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"
import {
  SBadge,
  STabContainer,
  SSubNavigationContainer,
} from "./SubNavigation.styled"

export const SubNavigationTabLink = ({
  to,
  icon,
  label,
  badge,
}: {
  to: string
  icon: ReactNode
  label: string
  badge?: string
}) => {
  const search = useSearch()

  return (
    <Link
      to={to}
      search={search}
      css={{ height: "100%" }}
      activeOptions={{ exact: true }}
    >
      {({ isActive }) => (
        <>
          <STabContainer active={isActive}>
            <Icon icon={icon} />
            <Text
              fs={13}
              color={isActive ? "white" : "iconGray"}
              tTransform="uppercase"
            >
              {label}
            </Text>
            {badge && <SBadge>{badge}</SBadge>}
          </STabContainer>
          {isActive && (
            <div
              sx={{ height: 1, bg: "brightBlue300", width: "100%" }}
              css={{ position: "relative", bottom: 1 }}
            />
          )}
        </>
      )}
    </Link>
  )
}

export const SubNavigation = ({ children }: { children: ReactNode }) => {
  return <SSubNavigationContainer>{children}</SSubNavigationContainer>
}
