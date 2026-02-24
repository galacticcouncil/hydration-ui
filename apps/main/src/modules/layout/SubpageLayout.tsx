import { Box, Grid } from "@galacticcouncil/ui/components"
import { Outlet, useMatchRoute } from "@tanstack/react-router"
import { FC, ReactNode, useMemo } from "react"

import { Breadcrumb, BreadcrumbItem } from "@/components/Breadcrumb"
import { TabItem, TabMenu } from "@/components/TabMenu"
import { LINKS } from "@/config/navigation"
import {
  Container,
  Content,
  ContentContainer,
  MainContent,
} from "@/modules/layout/components/Content"
import { useSubNav } from "@/modules/layout/hooks/useSubNav"
import { useIsLiquidityProvided } from "@/modules/liquidity/Liquidity.utils"

type Props = {
  readonly actions?: ReactNode
  readonly subpageMenu?: ReactNode
  readonly crumbs?: BreadcrumbItem[]
  readonly ignoreCurrentSearch?: boolean
}

export const SubpageLayout: FC<Props> = ({
  actions,
  subpageMenu,
  crumbs = [],
  ignoreCurrentSearch,
}) => {
  const isMatch = useMatchRoute()
  const isLiquidityPage = !!isMatch({ to: LINKS.liquidity })

  const subNav = useSubNav()

  const hasCrumbs = crumbs.length > 0
  const hasSubpageMenu =
    !hasCrumbs && (subpageMenu || subNav.length >= (actions ? 1 : 2))

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
              {hasSubpageMenu &&
                (isLiquidityPage ? (
                  <LiquidityTabMenu
                    items={subNav}
                    ignoreCurrentSearch={ignoreCurrentSearch}
                  />
                ) : (
                  <TabMenu
                    items={subNav}
                    size="medium"
                    variant="transparent"
                    ignoreCurrentSearch={ignoreCurrentSearch}
                    horizontalEdgeOffset="var(--layout-gutter)"
                  />
                ))}
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

const LiquidityTabMenu = ({
  ignoreCurrentSearch,
  items,
}: Pick<Props, "ignoreCurrentSearch"> & { items: TabItem[] }) => {
  const isLiquidityProvided = useIsLiquidityProvided()

  const filteredItems = useMemo(
    () =>
      isLiquidityProvided
        ? items
        : items.filter((tab) => tab.search?.myLiquidity === false),
    [items, isLiquidityProvided],
  )

  return (
    <TabMenu
      items={filteredItems}
      size="medium"
      variant="transparent"
      ignoreCurrentSearch={ignoreCurrentSearch}
    />
  )
}
