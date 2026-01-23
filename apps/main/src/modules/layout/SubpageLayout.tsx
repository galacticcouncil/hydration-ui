import { Box, Grid } from "@galacticcouncil/ui/components"
import { Outlet, useLocation } from "@tanstack/react-router"
import { FC, ReactNode, useMemo } from "react"

import { Breadcrumb, BreadcrumbItem } from "@/components/Breadcrumb"
import { TabItem, TabMenu } from "@/components/TabMenu"
import { NAVIGATION } from "@/config/navigation"
import {
  Container,
  Content,
  ContentContainer,
  MainContent,
} from "@/modules/layout/components/Content"
import { useMenuTranslations } from "@/modules/layout/components/HeaderMenu.utils"

type Props = {
  readonly actions?: ReactNode
  readonly subpageMenu?: ReactNode
  readonly crumbs?: BreadcrumbItem[]
  readonly ignoreCurrentSearch?: boolean
  readonly alwasShowSubNav?: boolean
}

export const SubpageLayout: FC<Props> = ({
  actions,
  subpageMenu,
  crumbs = [],
  ignoreCurrentSearch,
  alwasShowSubNav,
}) => {
  const translations = useMenuTranslations()
  const pathname = useLocation({
    select: (state) => state.pathname,
  })

  const subNav = useMemo(
    () =>
      NAVIGATION.find(({ to }) =>
        pathname.startsWith(to),
      )?.children?.map<TabItem>((nav) => ({
        to: nav.to,
        title: translations[nav.key].title,
        icon: nav.icon,
        search: nav.search,
      })) || [],
    [pathname, translations],
  )

  const hasCrumbs = crumbs.length > 0
  const hasSubpageMenu =
    !hasCrumbs && (alwasShowSubNav || subpageMenu || subNav.length >= 2)

  return (
    <Container>
      {hasCrumbs && (
        <ContentContainer>
          <Content>
            <Breadcrumb crumbs={crumbs} />
          </Content>
        </ContentContainer>
      )}

      {(hasSubpageMenu || actions) && (
        <ContentContainer>
          <Content>
            <Grid columnTemplate="1fr auto" align="center">
              {hasSubpageMenu && (
                <TabMenu
                  items={subNav}
                  size="medium"
                  variant="transparent"
                  ignoreCurrentSearch={ignoreCurrentSearch}
                />
              )}
              <Box sx={{ gridColumn: 2 }}>{actions}</Box>
            </Grid>
          </Content>
        </ContentContainer>
      )}

      <MainContent>
        <Outlet />
      </MainContent>
    </Container>
  )
}
