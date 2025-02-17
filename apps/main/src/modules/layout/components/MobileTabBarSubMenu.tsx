import { Rectangle7101 } from "@galacticcouncil/ui/assets/icons"
import {
  DropdownMenuItem,
  DropdownMenuItemArrow,
  DropdownMenuItemDescription,
  DropdownMenuItemIcon,
  DropdownMenuItemLabel,
} from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC } from "react"

import { NavigationItem } from "@/config/navigation"
import { useMenuTranslations } from "@/modules/layout/components/HeaderMenu.utils"

type Props = {
  readonly item: NavigationItem
}

export const MobileTabBarSubmenuItem: FC<Props> = ({ item }) => {
  const translations = useMenuTranslations()
  const { key, icon, to } = item

  const { title, description } = translations[key]

  return (
    <DropdownMenuItem key={key} asChild>
      <Link sx={{ textDecoration: "none" }} to={to}>
        <DropdownMenuItemIcon component={icon ?? Rectangle7101} />
        <DropdownMenuItemLabel>{title}</DropdownMenuItemLabel>
        {description && (
          <DropdownMenuItemDescription>
            {description}
          </DropdownMenuItemDescription>
        )}
        <DropdownMenuItemArrow />
      </Link>
    </DropdownMenuItem>
  )
}
