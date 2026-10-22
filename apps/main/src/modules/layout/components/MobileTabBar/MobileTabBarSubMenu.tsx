import {
  ArrowRight,
  IconPlaceholder,
  MoveUpRight,
} from "@galacticcouncil/ui/assets/icons"
import {
  MenuItemDescription,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
  MenuSelectionItemIcon,
} from "@galacticcouncil/ui/components"
import { Ref } from "react"

import { NavigationItem } from "@/config/navigation"
import { useMenuTranslations } from "@/modules/layout/components/HeaderMenu.utils"
import {
  isExternalNavItem,
  NavigationItemLink,
} from "@/modules/layout/components/NavigationItemLink"

type Props = {
  readonly item: NavigationItem
  readonly ref?: Ref<HTMLDivElement>
}

export const MobileTabBarSubmenuItem = ({ item, ...props }: Props) => {
  const translations = useMenuTranslations()
  const { key, icon } = item
  const external = isExternalNavItem(item)

  const { title, description } = translations[key] ?? {}

  return (
    <MenuSelectionItem {...props} asChild>
      <NavigationItemLink item={item}>
        <MenuItemIcon component={icon ?? IconPlaceholder} />
        <MenuItemLabel>{title}</MenuItemLabel>
        {description && (
          <MenuItemDescription>{description}</MenuItemDescription>
        )}
        {external ? (
          <MenuSelectionItemIcon component={MoveUpRight} />
        ) : (
          <MenuSelectionItemIcon component={ArrowRight} />
        )}
      </NavigationItemLink>
    </MenuSelectionItem>
  )
}
