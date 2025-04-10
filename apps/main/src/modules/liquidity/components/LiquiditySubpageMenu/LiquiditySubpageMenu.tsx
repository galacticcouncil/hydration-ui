import { Button, Flex } from "@galacticcouncil/ui/components"
import { Link, useLocation, useSearch } from "@tanstack/react-router"
import { useMemo } from "react"

import { SubpageItem } from "@/components/SubpageMenu/SubpageMenu"
import { LINKS, NAVIGATION } from "@/config/navigation"
import { useMenuTranslations } from "@/modules/layout/components/HeaderMenu.utils"
import { MyLiquidityTab } from "@/modules/liquidity/components"

export const LiquiditySubpageMenu = () => {
  const translations = useMenuTranslations()

  const [path, pathname] = useLocation({
    select: (state) => [state.href, state.pathname],
  })

  const { id } = useSearch({
    strict: false,
  })

  const items = useMemo(
    () =>
      NAVIGATION.find(({ to }) =>
        pathname?.startsWith(to),
      )?.children?.map<SubpageItem>((nav) => ({
        to: nav.to,
        title: translations[nav.key].title,
        icon: nav.icon,
      })) || [],
    [pathname, translations],
  )

  if (id !== undefined) return null

  return (
    <Flex gap={20}>
      {items.map(({ to, title, icon: IconComponent }) =>
        to === LINKS.myLiquidity ? (
          <MyLiquidityTab
            key={to}
            to={to}
            active={!!path?.startsWith(to)}
            title={title}
          />
        ) : (
          <Button
            key={to}
            variant={path?.startsWith(to) ? "secondary" : "tertiary"}
            asChild
          >
            <Link to={to}>
              {IconComponent && <IconComponent />}
              {title}
            </Link>
          </Button>
        ),
      )}
    </Flex>
  )
}
