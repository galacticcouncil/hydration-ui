import { Box, Flex, Grid, Separator } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { Outlet, useLocation } from "@tanstack/react-router"
import { FC, ReactNode, useMemo } from "react"

import { TabItem, TabMenu } from "@/components/TabMenu"
import { NAVIGATION } from "@/config/navigation"
import { useMenuTranslations } from "@/modules/layout/components/HeaderMenu.utils"

type Props = {
  readonly actions?: ReactNode
  readonly subpageMenu?: ReactNode
  readonly ignoreCurrentSearch?: boolean
}

export const SubpageLayout: FC<Props> = ({
  actions,
  subpageMenu,
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

  return (
    <Flex direction="column" py={8}>
      <Grid columnTemplate="1fr auto" align="center">
        {subpageMenu ||
          (subNav.length >= 2 && (
            <TabMenu
              items={subNav}
              size="large"
              variant="transparent"
              ignoreCurrentSearch={ignoreCurrentSearch}
            />
          ))}
        <Box sx={{ gridColumn: 2 }}>{actions}</Box>
      </Grid>
      {(!!subpageMenu || subNav.length >= 2 || !!actions) && (
        <Separator
          mt={8}
          mb={getTokenPx("scales.paddings.xxl")}
          sx={{
            width: "100vw",
            maxWidth: "100vw",
            position: "relative",
            left: "50%",
            right: "50%",
            marginLeft: "-50vw",
            marginRight: "-50vw",
          }}
        />
      )}
      <Outlet />
    </Flex>
  )
}
