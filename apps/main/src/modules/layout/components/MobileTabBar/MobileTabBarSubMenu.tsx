import { Rectangle7101 } from "@galacticcouncil/ui/assets/icons"
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
  const { key, icon, to } = item

  const { title, description } = translations[key] ?? {}

  return (
    <MenuSelectionItem as={Link} {...{ to }} {...props}>
      <MenuItemIcon component={icon ?? Rectangle7101} />
      <MenuItemLabel>{title}</MenuItemLabel>
      {description && <MenuItemDescription>{description}</MenuItemDescription>}
      <MenuSelectionItemArrow />
    </MenuSelectionItem>
  )
}
