import { useLocation } from "@tanstack/react-router"
import { useMemo } from "react"

import { TabItem } from "@/components/TabMenu"
import { LINKS } from "@/config/navigation"
import { useMenuTranslations } from "@/modules/layout/components/HeaderMenu.utils"
import { useNavigation } from "@/modules/layout/hooks/useNavigation"

export const useSubNav = () => {
  const navigation = useNavigation()
  const translations = useMenuTranslations()
  const pathname = useLocation({
    select: (state) => state.pathname,
  })

  const path = pathname === LINKS.home ? LINKS.trade : pathname

  return useMemo(
    () =>
      navigation
        .find(({ to }) => path.startsWith(to))
        ?.children?.map<TabItem>((nav) => ({
          to: nav.to,
          title: translations[nav.key].title,
          icon: nav.icon,
          search: nav.search,
        })) || [],
    [path, translations, navigation],
  )
}
