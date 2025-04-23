import { Rectangle7101 } from "@galacticcouncil/ui/assets/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuContentDivider,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { Link } from "@tanstack/react-router"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  bottomNavOrder,
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
} from "@/modules/layout/components/MobileTabBar/MobileTabBar.styled"
import { MobileTabBarActions } from "@/modules/layout/components/MobileTabBar/MobileTabBarActions"
import { MobileTabBarSettings } from "@/modules/layout/components/MobileTabBar/MobileTabBarSettings"
import { MobileTabBarSubmenuItem } from "@/modules/layout/components/MobileTabBar/MobileTabBarSubMenu"

export enum MobileTabBarDrawer {
  Settings = "Settings",
}

export const MobileTabBar: FC = () => {
  const { t } = useTranslation()
  const translations = useMenuTranslations()
  const { isMobile } = useBreakpoints()

  const [drawer, setDrawer] = useState<MobileTabBarDrawer | null>(null)
  const closeDrawer = () => setDrawer(null)

  const itemsShown = isMobile ? NAV_ITEMS_SHOWN_MOBILE : NAV_ITEMS_SHOWN_TABLET
  const navItems = NAVIGATION.toSorted(
    (item1, item2) =>
      bottomNavOrder.indexOf(item1.key) - bottomNavOrder.indexOf(item2.key),
  )
  const moreItems = navItems.slice(itemsShown)

  return (
    <SMobileTabBar>
      {navItems
        .slice(0, itemsShown)
        .map(({ key, icon, to, children }, index) => (
          <DropdownMenu key={key}>
            <DropdownMenuTrigger asChild>
              <STabBarItem as={Link} {...{ to }} tabIndex={index + 1}>
                <STabBarIcon component={icon ?? Rectangle7101} />
                <STabBarLabel>{translations[key]?.title}</STabBarLabel>
              </STabBarItem>
            </DropdownMenuTrigger>
            {children && (
              <DropdownMenuContent fullWidth>
                {children.map((item) => (
                  <DropdownMenuItem key={item.key} asChild>
                    <MobileTabBarSubmenuItem item={item} />
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        ))}
      {moreItems.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <STabBarItem sx={{ cursor: "pointer" }} tabIndex={itemsShown + 1}>
              <STabBarIcon component={Rectangle7101} />
              <STabBarLabel>{t("more")}</STabBarLabel>
            </STabBarItem>
          </DropdownMenuTrigger>
          {!drawer && (
            <DropdownMenuContent fullWidth>
              <MobileTabBarActions onOpenDrawer={setDrawer} />
              <DropdownMenuContentDivider />
              {moreItems.map((item) => (
                <DropdownMenuItem key={item.key} asChild>
                  <MobileTabBarSubmenuItem item={item} />
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      )}
      <MobileTabBarSettings
        isOpen={drawer === MobileTabBarDrawer.Settings}
        onClose={closeDrawer}
      />
    </SMobileTabBar>
  )
}
