import { useLocation, useMatches } from "@tanstack/react-router"
import { useMemo } from "react"

import { TabItem } from "@/components/TabMenu"
import { LINKS } from "@/config/navigation"
import { useMenuTranslations } from "@/modules/layout/components/HeaderMenu.utils"
import { isInternalNavItem } from "@/modules/layout/components/NavigationItemLink"
import { useNavigation } from "@/modules/layout/hooks/useNavigation"

export const useSubNav = () => {
  const navigation = useNavigation()
  const translations = useMenuTranslations()
  const pathname = useLocation({
    select: (state) => state.pathname,
  })

  // nearest match that declares the flag wins, so a child route can override
  // its parent
  const showSubNav = useMatches({
    select: (matches) =>
      matches.findLast((match) => match.staticData.showSubNav !== undefined)
        ?.staticData.showSubNav,
  })

  const path = pathname === LINKS.home ? LINKS.trade : pathname

  const items = useMemo(
    () =>
      navigation
        .filter(isInternalNavItem)
        .find(({ to }) => path.startsWith(to))
        ?.children?.map<TabItem>((nav) => ({
          to: nav.to,
          title: translations[nav.key].title,
          icon: nav.icon,
          search: nav.search,
        })) || [],
    [path, translations, navigation],
  )

  return { items, hasSubNav: showSubNav ?? items.length > 1 }
}
