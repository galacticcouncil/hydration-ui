import { Link, useSearch } from "@tanstack/react-location"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { ReactNode } from "react"
import { theme } from "theme"
import {
  SBadge,
  STabContainer,
  SubNavigationContainer,
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
      css={{
        "&:hover > div > p": { color: theme.colors.white },
        height: "100%",
      }}
    >
      {({ isActive }) => (
        <>
          <STabContainer>
            <Icon sx={{ color: "brightBlue300" }} icon={icon} />
            <Text fs={13} color={isActive ? "white" : "iconGray"}>
              {label}
            </Text>
            {badge && <SBadge>{badge}</SBadge>}
          </STabContainer>
          {isActive && (
            <div
              sx={{ height: 1, bg: "brightBlue300", width: "100%" }}
              css={{ position: "relative", bottom: 0 }}
            />
          )}
        </>
      )}
    </Link>
  )
}

export const SubNavigation = ({ children }: { children: ReactNode }) => {
  return <SubNavigationContainer>{children}</SubNavigationContainer>
}
