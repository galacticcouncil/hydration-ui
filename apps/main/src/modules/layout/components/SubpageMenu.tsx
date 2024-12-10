import { Button, Flex } from "@galacticcouncil/ui/components"
import { Link, useLocation } from "@tanstack/react-router"
import { useMemo } from "react"

import { NAVIGATION } from "@/config/navigation"
import { useMenuTranslations } from "@/modules/layout/components/HeaderMenu.utils"

export const SubpageMenu = () => {
  const translations = useMenuTranslations()
  const pathname = useLocation({
    select: (state) => state.pathname,
  })

  const subnav = useMemo(
    () => NAVIGATION.find(({ to }) => pathname.startsWith(to))?.children || [],
    [pathname],
  )

  return (
    <Flex gap={20} mb={20} justify="center">
      {subnav.map(({ key, to, icon: IconComponent }) => (
        <Button
          key={key}
          variant={pathname === to ? "secondary" : "tertiary"}
          asChild
        >
          <Link to={to}>
            {IconComponent && <IconComponent />}
            {translations[key].title}
          </Link>
        </Button>
      ))}
    </Flex>
  )
}
