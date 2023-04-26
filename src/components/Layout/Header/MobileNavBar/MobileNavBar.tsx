import { Link, useSearch } from "@tanstack/react-location"
import { Icon } from "components/Icon/Icon"
import { useTranslation } from "react-i18next"

import { MENU_ITEMS, TabItem } from "utils/navigation"
import { HeaderSubMenu } from "../menu/HeaderSubMenu"
import {
  SMobileNavBar,
  SNavBarItem,
  SNavBarItemHidden,
} from "./MobileNavBar.styled"
import { MoreButton } from "./MoreButton"

export const MobileNavBarItem = ({
  item,
  isActive,
}: {
  item: TabItem
  isActive?: boolean
}) => {
  const { t } = useTranslation()

  return (
    <SNavBarItem active={isActive}>
      <Icon size={20} icon={<item.Icon />} />
      {t(`header.${item.key}`)}
    </SNavBarItem>
  )
}

export const MobileNavBar = () => {
  const { t } = useTranslation()
  const { account } = useSearch()

  const [visibleTabs, hiddenTabs] = MENU_ITEMS.filter(
    (item) => item.enabled,
  ).reduce(
    (result, value) => {
      const isVisible = value.mobVisible
      result[isVisible ? 0 : 1].push(value)
      return result
    },
    [[], []] as [TabItem[], TabItem[]],
  )

  const hiddenTabItems = hiddenTabs.map((hiddenTab, index) => (
    <SNavBarItemHidden
      to={hiddenTab.href}
      search={account ? { account } : undefined}
      key={index}
    >
      <Icon size={20} icon={<hiddenTab.Icon />} />
      {t(`header.${hiddenTab.key}`)}
    </SNavBarItemHidden>
  ))

  return (
    <SMobileNavBar>
      {visibleTabs
        .sort((a, b) => a.mobOrder - b.mobOrder)
        .map((item, index) => {
          if (!item.href && item.subItems?.length) {
            return <HeaderSubMenu item={item} key={index} />
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
              search={account ? { account } : undefined}
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
    </SMobileNavBar>
  )
}
