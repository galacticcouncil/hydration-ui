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
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  bottomNavOrder,
  NAV_ITEMS_SHOWN_MOBILE,
  NAV_ITEMS_SHOWN_TABLET,
  NavigationKey,
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
import {
  isExternalNavItem,
  NavigationItemLabel,
  NavigationItemLink,
} from "@/modules/layout/components/NavigationItemLink"
import { SettingsModal } from "@/modules/layout/components/Settings/SettingsModal"
import { useHasMobNavbar } from "@/modules/layout/hooks/useHasMobNavbar"
import { useNavigation } from "@/modules/layout/hooks/useNavigation"

export enum MobileTabBarDrawer {
  Settings = "Settings",
}

const getBottomNavOrder = (key: NavigationKey) => {
  const order = bottomNavOrder.indexOf(key)
  return order === -1 ? bottomNavOrder.length : order
}

export const MobileTabBar: FC = () => {
  const { t } = useTranslation()
  const translations = useMenuTranslations()
  const navigation = useNavigation()
  const { isMobile } = useBreakpoints()
  const hasMobNavbar = useHasMobNavbar()

  const [drawer, setDrawer] = useState<MobileTabBarDrawer | null>(null)
  const closeDrawer = () => setDrawer(null)

  const itemsShown = isMobile ? NAV_ITEMS_SHOWN_MOBILE : NAV_ITEMS_SHOWN_TABLET

  const navItems = navigation.toSorted(
    (item1, item2) =>
      getBottomNavOrder(item1.key) - getBottomNavOrder(item2.key),
  )
  const moreItems = navItems.slice(itemsShown)

  if (!hasMobNavbar) return null

  return (
    <SMobileTabBar>
      {navItems.slice(0, itemsShown).map((item, index) => {
        const { key, icon } = item
        const external = isExternalNavItem(item)

        return (
          <NavigationItemLink key={key} item={item}>
            <STabBarItem tabIndex={index + 1}>
              <STabBarIcon component={icon ?? IconPlaceholder} />
              <STabBarLabel>
                <NavigationItemLabel
                  title={translations[key]?.title ?? ""}
                  external={external}
                />
              </STabBarLabel>
            </STabBarItem>
          </NavigationItemLink>
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
            <DropdownMenuContent
              fullWidth
              animation="slide-bottom"
              sx={{ zIndex: 1 }}
            >
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
