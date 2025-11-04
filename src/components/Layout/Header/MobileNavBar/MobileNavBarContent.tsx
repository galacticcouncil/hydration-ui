import { Link, useSearch } from "@tanstack/react-location"
import { Icon } from "components/Icon/Icon"
import { HeaderSubMenu } from "components/Layout/Header/menu/HeaderSubMenu"
import { Trans, useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { LINKS, resetSearchParams } from "utils/navigation"
import { SNavBarItemHidden } from "./MobileNavBar.styled"
import { MobileNavBarItem } from "./MobileNavBarItem"
import { MoreButton } from "./MoreButton"
import { SNoFunBadge } from "components/Layout/Header/menu/HeaderMenu.styled"
import { useMemo, useState } from "react"
import { useActiveMenuItems } from "components/Layout/Header/menu/HeaderMenu.utils"
import { groupBy } from "utils/rx"

export const MobileNavBarContent = () => {
  const { t } = useTranslation()
  const search = useSearch()
  const isMediumMedia = useMedia(theme.viewport.gte.sm)

  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null)

  const menuItems = useActiveMenuItems()

  const { visibleTabs = [], hiddenTabs = [] } = useMemo(() => {
    return groupBy(menuItems, (item) => {
      const isVisible = isMediumMedia ? item.tabVisible : item.mobVisible
      return isVisible ? "visibleTabs" : "hiddenTabs"
    })
  }, [isMediumMedia, menuItems])

  const hiddenTabItems = hiddenTabs.map((hiddenTab, index) => (
    <SNavBarItemHidden
      to={hiddenTab.href}
      search={resetSearchParams(search)}
      key={index}
      disabled={hiddenTab.disabled}
    >
      <Icon size={20} icon={<hiddenTab.Icon />} />
      {t(`header.${hiddenTab.key}`)}
      {LINKS.memepad === hiddenTab.href && (
        <SNoFunBadge>
          <Trans t={t} i18nKey="memepad.badge.nofun">
            <span />
            <span />
          </Trans>
        </SNoFunBadge>
      )}
    </SNavBarItemHidden>
  ))

  return (
    <>
      {visibleTabs
        .sort((a, b) => a.mobOrder - b.mobOrder)
        .map((item, index) => {
          if (item.subItems?.length) {
            return (
              <HeaderSubMenu
                isOpen={activeSubMenu === item.key}
                onOpenChange={() =>
                  setActiveSubMenu((prev) =>
                    prev === item.key ? null : item.key,
                  )
                }
                key={index}
                item={item}
              />
            )
          }
          if (item.external) {
            return (
              <a href={item.href} key={index} sx={{ height: "100%" }}>
                <MobileNavBarItem item={item} />
              </a>
            )
          }

          return (
            <Link
              to={item.href}
              key={index}
              search={resetSearchParams(search)}
              css={{ height: "100%" }}
              disabled={item.disabled}
            >
              {({ isActive }) => (
                <MobileNavBarItem item={item} isActive={isActive} />
              )}
            </Link>
          )
        })}
      {(hiddenTabItems?.length ?? 0) > 0 && (
        <MoreButton tabs={hiddenTabItems} />
      )}
    </>
  )
}
