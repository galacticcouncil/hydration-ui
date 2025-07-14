import { useLocation } from "@tanstack/react-router"
import { useMemo } from "react"

import { TabItem, TabMenu } from "@/components/TabMenu/TabMenu"
import { NAVIGATION } from "@/config/navigation"
import { useMenuTranslations } from "@/modules/layout/components/HeaderMenu.utils"

export const SubpageMenu = () => {
  const translations = useMenuTranslations()
  const pathname = useLocation({
    select: (state) => state.pathname,
  })

  const subnav = useMemo(
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

  return <TabMenu items={subnav} size="large" variant="transparent" />
}
