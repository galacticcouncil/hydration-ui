import { Rectangle7101 } from "@galacticcouncil/ui/assets/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { Link } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  mobileNavOrder,
  NAV_ITEMS_SHOWN_MOBILE,
  NAV_ITEMS_SHOWN_TABLET,
  NAVIGATION,
} from "@/config/navigation"
import { useMenuTranslations } from "@/modules/layout/components/HeaderMenu.utils"
import {
  SMobileTabBar,
  STabBarIcon,
  STabBarItem,
  STabBarLabel,
} from "@/modules/layout/components/MobileTabBar.styled"
import { MobileTabBarSubmenuItem } from "@/modules/layout/components/MobileTabBarSubMenu"

export const MobileTabBar: FC = () => {
  const { t } = useTranslation()
  const translations = useMenuTranslations()
  const { isMobile } = useBreakpoints()

  const itemsShown = isMobile ? NAV_ITEMS_SHOWN_MOBILE : NAV_ITEMS_SHOWN_TABLET
  const navItems = NAVIGATION.toSorted(
    (item1, item2) =>
      mobileNavOrder.indexOf(item1.key) - mobileNavOrder.indexOf(item2.key),
  )
  const moreItems = navItems.slice(itemsShown)

  return (
    <SMobileTabBar>
      {navItems.slice(0, itemsShown).map(({ key, icon, to, children }) => (
        <DropdownMenu key={key}>
          <DropdownMenuTrigger asChild>
            <Link
              to={to}
              sx={{
                textDecoration: "none",
              }}
            >
              <STabBarItem>
                <STabBarIcon component={icon ?? Rectangle7101} />
                <STabBarLabel>{translations[key].title}</STabBarLabel>
              </STabBarItem>
            </Link>
          </DropdownMenuTrigger>
          {children && (
            <DropdownMenuContent fullWidth>
              {children.map((item) => (
                <MobileTabBarSubmenuItem key={item.key} item={item} />
              ))}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      ))}
      {moreItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <STabBarItem sx={{ cursor: "pointer" }}>
              <STabBarIcon component={Rectangle7101} />
              <STabBarLabel>{t("more")}</STabBarLabel>
            </STabBarItem>
          </DropdownMenuTrigger>
          <DropdownMenuContent fullWidth>
            {moreItems.map((item) => (
              <MobileTabBarSubmenuItem key={item.key} item={item} />
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </SMobileTabBar>
  )
}
