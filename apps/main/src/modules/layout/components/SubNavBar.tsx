import { Box, Grid } from "@galacticcouncil/ui/components"
import { useMatchRoute } from "@tanstack/react-router"
import { FC, ReactNode, useMemo } from "react"

import { TabItem, TabMenu } from "@/components/TabMenu"
import { LINKS } from "@/config/navigation"
import { Content, ContentContainer } from "@/modules/layout/components/Content"
import { useSubNav } from "@/modules/layout/hooks/useSubNav"
import { useIsLiquidityProvided } from "@/modules/liquidity/Liquidity.utils"

type Props = {
  readonly actions?: ReactNode
  readonly ignoreCurrentSearch?: boolean
}

export const SubNavBar: FC<Props> = ({ actions, ignoreCurrentSearch }) => {
  const isMatch = useMatchRoute()
  const isLiquidityPage = !!isMatch({ to: LINKS.liquidity })

  const { items: subNav, hasSubNav } = useSubNav()

  if (!hasSubNav && !actions) return null

  return (
    <ContentContainer>
      <Content>
        <Grid columnTemplate="1fr auto" align="center">
          {hasSubNav &&
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
