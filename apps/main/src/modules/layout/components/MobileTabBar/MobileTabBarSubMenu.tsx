import { IconPlaceholder } from "@galacticcouncil/ui/assets/icons"
import {
  MenuItemDescription,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
  MenuSelectionItemArrow,
} from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { Ref } from "react"

import { NavigationItem } from "@/config/navigation"
import { useMenuTranslations } from "@/modules/layout/components/HeaderMenu.utils"

type Props = {
  readonly item: NavigationItem
  readonly ref?: Ref<HTMLDivElement>
}

export const MobileTabBarSubmenuItem = ({ item, ...props }: Props) => {
  const translations = useMenuTranslations()
  const { key, icon, to, search, defaultChild } = item

  const { title, description } = translations[key] ?? {}
  const linkTo = defaultChild ?? to

  return (
    <MenuSelectionItem {...props} asChild>
      <Link to={linkTo} search={search}>
        <MenuItemIcon component={icon ?? IconPlaceholder} />
        <MenuItemLabel>{title}</MenuItemLabel>
        {description && (
          <MenuItemDescription>{description}</MenuItemDescription>
        )}
        <MenuSelectionItemArrow />
      </Link>
    </MenuSelectionItem>
  )
}
