import { useLocation } from "@tanstack/react-router"
import { useMemo } from "react"

import { TabItem } from "@/components/TabMenu"
import { LINKS, NAVIGATION } from "@/config/navigation"
import { useMenuTranslations } from "@/modules/layout/components/HeaderMenu.utils"

export const useSubNav = () => {
  const translations = useMenuTranslations()
  const pathname = useLocation({
    select: (state) => state.pathname,
  })

  const path = pathname === LINKS.home ? LINKS.trade : pathname

  return useMemo(
    () =>
      NAVIGATION.find(({ to }) => path.startsWith(to))?.children?.map<TabItem>(
        (nav) => ({
          to: nav.to,
          title: translations[nav.key].title,
          icon: nav.icon,
          search: nav.search,
        }),
      ) || [],
    [path, translations],
  )
}
