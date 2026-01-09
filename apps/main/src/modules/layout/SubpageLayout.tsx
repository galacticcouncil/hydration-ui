import { Box, Grid, Separator } from "@galacticcouncil/ui/components"
import { css, getToken, styled } from "@galacticcouncil/ui/utils"
import { Outlet, useLocation } from "@tanstack/react-router"
import { FC, ReactNode, useMemo } from "react"

import { Breadcrumb, BreadcrumbItem } from "@/components/Breadcrumb"
import { TabItem, TabMenu } from "@/components/TabMenu"
import { NAVIGATION } from "@/config/navigation"
import { Content, MainContent } from "@/modules/layout/components/Content"
import { useMenuTranslations } from "@/modules/layout/components/HeaderMenu.utils"

type Props = {
  readonly actions?: ReactNode
  readonly subpageMenu?: ReactNode
  readonly crumbs?: BreadcrumbItem[]
  readonly ignoreCurrentSearch?: boolean
  readonly subpageMenuHidden?: boolean
}

export const SubpageLayout: FC<Props> = ({
  actions,
  subpageMenu,
  crumbs = [],
  ignoreCurrentSearch,
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

  return (
    <>
      {hasCrumbs && (
        <Box
          py={8}
          sx={{
            borderBottomWidth: 1,
            borderBottomStyle: "solid",
            borderBottomColor: getToken("details.separators"),
          }}
        >
          <Content>
            <Breadcrumb crumbs={crumbs} />
          </Content>
        </Box>
      )}
      <MainContent>
        <Grid columnTemplate="1fr auto" align="center">
          {hasCrumbs
            ? null
            : subpageMenu ||
              (subNav.length >= 2 && (
                <TabMenu
                  items={subNav}
                  size="medium"
                  variant="transparent"
                  ignoreCurrentSearch={ignoreCurrentSearch}
                />
              ))}
          <Box sx={{ gridColumn: 2 }}>{actions}</Box>
        </Grid>
        {!hasCrumbs && (!!subpageMenu || subNav.length >= 2 || !!actions) && (
          <SubpageLayoutBottomSeparator />
        )}
        <Outlet />
      </MainContent>
    </>
  )
}

const SubpageLayoutBottomSeparator = styled(Separator)(
  ({ theme }) => css`
    position: relative;
    left: 50%;
    right: 50%;
    margin-left: -50vw;
    margin-right: -50vw;
    width: 100vw;
    max-width: 100vw;

    margin-top: 8px;
    margin-bottom: ${theme.scales.paddings.xxl}px;
  `,
)
