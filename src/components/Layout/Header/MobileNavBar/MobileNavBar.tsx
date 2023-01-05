import { useTranslation } from "react-i18next"
import { Icon } from "components/Icon/Icon"
import { Link } from "@tanstack/react-location"
import { ReactComponent as PoolsAndFarmsIcon } from "assets/icons/PoolsAndFarms.svg"
import { ReactComponent as TradeIcon } from "assets/icons/Trade.svg"
import { ReactComponent as WalletIcon } from "assets/icons/Wallet.svg"
//import { ReactComponent as LBPIcon } from "assets/icons/LBPIcon.svg"
//import { ReactComponent as BridgeIcon } from "assets/icons/BridgeIcon.svg"
import {
  SMobileNavBar,
  SNavBarItem,
  SNavBarItemHidden,
} from "./MobileNavBar.styled"
import { MoreButton } from "./MoreButton"
import { MENU_ITEMS, TabKeys, TabObject } from "utils/navigation"

export const MobileNavBar = () => {
  const { t } = useTranslation()

  const getIcon = (name: TabKeys) => {
    if (name === "trade") return <TradeIcon />
    if (name === "pools") return <PoolsAndFarmsIcon />
    if (name === "wallet") return <WalletIcon />
    //if (name === "lbp") return <LBPIcon />
    //if (name === "bridge") return <BridgeIcon />

    return null
  }

  const [visibleTabs, hiddenTabs] = MENU_ITEMS.filter(
    (item) => item.enabled,
  ).reduce(
    (result, value) => {
      const isVisible = value.mobVisible
      result[isVisible ? 0 : 1].push(value)
      return result
    },
    [[], []] as [TabObject[], TabObject[]],
  )

  const hiddenTabItems = hiddenTabs.map((hiddenTab, index) => (
    <SNavBarItemHidden to={hiddenTab.href} key={index}>
      <Icon size={20} icon={getIcon(hiddenTab.key)} />
      {t(hiddenTab.translationKey)}
    </SNavBarItemHidden>
  ))

  return (
    <SMobileNavBar>
      {visibleTabs.map((item, index) => {
        if (item.external) {
          return (
            <a href={item.href} key={index} sx={{ height: "100%" }}>
              <SNavBarItem key={index}>
                <Icon size={20} icon={getIcon(item.key)} />
                {t(item.translationKey)}
              </SNavBarItem>
            </a>
          )
        }

        return (
          <Link to={item.href} key={index} css={{ height: "100%" }}>
            {({ isActive }) => (
              <SNavBarItem key={index} active={isActive}>
                <Icon size={20} icon={getIcon(item.key)} />
                {t(item.translationKey)}
              </SNavBarItem>
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
