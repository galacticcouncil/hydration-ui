import { Link, useSearch } from "@tanstack/react-location"
import { Icon } from "components/Icon/Icon"
import { HeaderSubMenu } from "components/Layout/Header/menu/HeaderSubMenu"
import { useRpcProvider } from "providers/rpcProvider"
import { Trans, useTranslation } from "react-i18next"
import { useMedia } from "react-use"
import { theme } from "theme"
import { LINKS, MENU_ITEMS, TabItem, resetSearchParams } from "utils/navigation"
import { SNavBarItemHidden } from "./MobileNavBar.styled"
import { MobileNavBarItem } from "./MobileNavBarItem"
import { MoreButton } from "./MoreButton"
import { SNoFunBadge } from "components/Layout/Header/menu/HeaderMenu.styled"
import { useState } from "react"

export const MobileNavBarContent = () => {
  const { t } = useTranslation()
  const { featureFlags } = useRpcProvider()
  const search = useSearch()
  const isMediumMedia = useMedia(theme.viewport.gte.sm)

  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null)

  const [visibleTabs, hiddenTabs] = MENU_ITEMS.filter(
    (item) => item.enabled && !(item.asyncEnabled && !featureFlags[item.key]),
  ).reduce(
    (result, value) => {
      const isVisible = isMediumMedia ? value.tabVisible : value.mobVisible
      result[isVisible ? 0 : 1].push(value)
      return result
    },
    [[], []] as [TabItem[], TabItem[]],
  )

  const hiddenTabItems = hiddenTabs.map((hiddenTab, index) => (
    <SNavBarItemHidden
      to={hiddenTab.href}
      search={resetSearchParams(search)}
      key={index}
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
