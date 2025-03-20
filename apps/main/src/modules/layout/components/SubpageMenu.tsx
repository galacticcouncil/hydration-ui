import { useLocation } from "@tanstack/react-router"
import { useMemo } from "react"

import {
  SubpageItem,
  SubpageMenu as SubpageMenuComponent,
} from "@/components/SubpageMenu/SubpageMenu"
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
      )?.children?.map<SubpageItem>((nav) => ({
        to: nav.to,
        title: translations[nav.key].title,
        icon: nav.icon,
      })) || [],
    [pathname, translations],
  )

  return <SubpageMenuComponent items={subnav} />
}
