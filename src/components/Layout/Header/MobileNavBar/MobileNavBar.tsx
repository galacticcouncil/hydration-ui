import { Link, useSearch } from "@tanstack/react-location"
import { Icon } from "components/Icon/Icon"
import { useTranslation } from "react-i18next"

import { MENU_ITEMS, TabItem } from "utils/navigation"
import { HeaderSubMenu } from "components/Layout/Header/menu/HeaderSubMenu"
import {
  SMobileNavBar,
  SNavBarItem,
  SNavBarItemHidden,
} from "./MobileNavBar.styled"
import { MoreButton } from "./MoreButton"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useProviderRpcUrlStore } from "api/provider"
import { useApiPromise } from "utils/api"
import { useBestNumber } from "api/chain"
import { isApiLoaded } from "utils/helpers"
import { enableStakingBlock } from "utils/constants"

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
  const isMediumMedia = useMedia(theme.viewport.gte.sm)

  const providers = useProviderRpcUrlStore()
  const api = useApiPromise()
  const bestNumber = useBestNumber(!isApiLoaded(api))

  const isMainnet =
    (providers.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL) ===
      "wss://rpc.hydradx.cloud" || import.meta.env.VITE_ENV === "production"

  const blockNumber = bestNumber.data?.parachainBlockNumber.toNumber()

  if (!blockNumber) return null

  const [visibleTabs, hiddenTabs] = MENU_ITEMS.filter(
    (item) => item.enabled,
  ).reduce(
    (result, value) => {
      if (
        value.key === "staking" &&
        isMainnet &&
        blockNumber < enableStakingBlock
      )
        return result

      const isVisible = isMediumMedia ? value.tabVisible : value.mobVisible
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
            return <HeaderSubMenu key={index} item={item} />
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
