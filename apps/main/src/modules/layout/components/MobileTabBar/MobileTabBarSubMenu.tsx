import { Rectangle7101 } from "@galacticcouncil/ui/assets/icons"
import {
  SMenuItemDescription,
  SMenuItemIcon,
  SMenuItemLabel,
  SMenuSelectionItem,
  SMenuSelectionItemArrow,
} from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { forwardRef } from "react"

import { NavigationItem } from "@/config/navigation"
import { useMenuTranslations } from "@/modules/layout/components/HeaderMenu.utils"

type Props = {
  readonly item: NavigationItem
}

export const MobileTabBarSubmenuItem = forwardRef<HTMLDivElement, Props>(
  ({ item, ...props }, ref) => {
    const translations = useMenuTranslations()
    const { key, icon, to } = item

    const { title, description } = translations[key] ?? {}

    return (
      <SMenuSelectionItem ref={ref} as={Link} {...{ to }} {...props}>
        <SMenuItemIcon component={icon ?? Rectangle7101} />
        <SMenuItemLabel>{title}</SMenuItemLabel>
        {description && (
          <SMenuItemDescription>{description}</SMenuItemDescription>
        )}
        <SMenuSelectionItemArrow />
      </SMenuSelectionItem>
    )
  },
)

MobileTabBarSubmenuItem.displayName = "MobileTabBarSubmenuItem"
