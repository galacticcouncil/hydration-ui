import { IconPlaceholder, MenuSlanted } from "@galacticcouncil/ui/assets/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuContentDivider,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Modal,
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
import { MobileTabBarSubmenuItem } from "@/modules/layout/components/MobileTabBar/MobileTabBarSubMenu"
import { SettingsModal } from "@/modules/layout/components/Settings/SettingsModal"
import { useHasMobNavbar } from "@/modules/layout/hooks/useHasMobNavbar"

export enum MobileTabBarDrawer {
  Settings = "Settings",
}

export const MobileTabBar: FC = () => {
  const { t } = useTranslation()
  const translations = useMenuTranslations()
  const { isMobile } = useBreakpoints()
  const hasMobNavbar = useHasMobNavbar()

  const [drawer, setDrawer] = useState<MobileTabBarDrawer | null>(null)
  const closeDrawer = () => setDrawer(null)

  const itemsShown = isMobile ? NAV_ITEMS_SHOWN_MOBILE : NAV_ITEMS_SHOWN_TABLET
  const navItems = NAVIGATION.toSorted(
    (item1, item2) =>
      bottomNavOrder.indexOf(item1.key) - bottomNavOrder.indexOf(item2.key),
  )
  const moreItems = navItems.slice(itemsShown)

  if (!hasMobNavbar) return null

  return (
    <SMobileTabBar>
      {navItems
        .slice(0, itemsShown)
        .map(({ key, icon, to, defaultChild }, index) => {
          const linkTo = defaultChild ?? to
          return (
            <STabBarItem
              key={key}
              as={Link}
              {...{ to: linkTo }}
              tabIndex={index + 1}
            >
              <STabBarIcon component={icon ?? IconPlaceholder} />
              <STabBarLabel>{translations[key]?.title}</STabBarLabel>
            </STabBarItem>
          )
        })}
      {moreItems.length > 0 && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <STabBarItem sx={{ cursor: "pointer" }} tabIndex={itemsShown + 1}>
              <STabBarIcon component={MenuSlanted} />
              <STabBarLabel>{t("more")}</STabBarLabel>
            </STabBarItem>
          </DropdownMenuTrigger>
          {!drawer && (
            <DropdownMenuContent fullWidth animation="slide-bottom">
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
      <Modal
        variant="popup"
        open={drawer === MobileTabBarDrawer.Settings}
        onOpenChange={closeDrawer}
      >
        <SettingsModal />
      </Modal>
    </SMobileTabBar>
  )
}
