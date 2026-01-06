import { useLocation } from "@tanstack/react-router"
import { FC, useMemo } from "react"

import { TabItem, TabMenu } from "@/components/TabMenu/TabMenu"
import { NAVIGATION } from "@/config/navigation"
import { useMenuTranslations } from "@/modules/layout/components/HeaderMenu.utils"

type Props = {
  readonly ignoreCurrentSearch?: boolean
}

export const SubpageMenu: FC<Props> = ({ ignoreCurrentSearch }) => {
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

  if (subnav.length < 2) return null

  return (
    <TabMenu
      items={subnav}
      size="medium"
      variant="transparent"
      ignoreCurrentSearch={ignoreCurrentSearch}
    />
  )
}
