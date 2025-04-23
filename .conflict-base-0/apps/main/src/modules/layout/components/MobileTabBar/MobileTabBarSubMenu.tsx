import { Rectangle7101 } from "@galacticcouncil/ui/assets/icons"
import {
  MenuItemDescription,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
  MenuSelectionItemArrow,
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
      <MenuSelectionItem ref={ref} as={Link} {...{ to }} {...props}>
        <MenuItemIcon component={icon ?? Rectangle7101} />
        <MenuItemLabel>{title}</MenuItemLabel>
        {description && (
          <MenuItemDescription>{description}</MenuItemDescription>
        )}
        <MenuSelectionItemArrow />
      </MenuSelectionItem>
    )
  },
)

MobileTabBarSubmenuItem.displayName = "MobileTabBarSubmenuItem"
