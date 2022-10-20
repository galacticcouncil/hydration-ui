import { useTranslation } from "react-i18next"
import { Icon } from "components/Icon/Icon"
import { Link } from "@tanstack/react-location"
import { ReactComponent as PoolsAndFarmsIcon } from "assets/icons/PoolsAndFarms.svg"
import { ReactComponent as TradeIcon } from "assets/icons/Trade.svg"
import { ReactComponent as WalletIcon } from "assets/icons/Wallet.svg"
import { MENU_ITEMS, TabKeys } from "utils/tabs"
import { SMobileNavBar, SNavBarItem } from "./MobileNavBar.styled"

export const MobileNavBar = () => {
  const { t } = useTranslation("translation")

  const getIcon = (name: TabKeys) => {
    if (name === "trade") return <TradeIcon />
    if (name === "pools") return <PoolsAndFarmsIcon />
    if (name === "wallet") return <WalletIcon />
    // TODO: add missing icons in Figma
    return null
  }

  return (
    <SMobileNavBar>
      {MENU_ITEMS.map((item, index) => {
        if (item.external) {
          return (
            <a href={item.href} key={index}>
              <SNavBarItem key={index}>
                <Icon size={20} icon={getIcon(item.key)} />
                {t(item.translationKey)}
              </SNavBarItem>
            </a>
          )
        }

        return (
          <Link to={item.href} key={index}>
            {({ isActive }) => (
              <SNavBarItem key={index} active={isActive}>
                <Icon size={20} icon={getIcon(item.key)} />
                {t(item.translationKey)}
              </SNavBarItem>
            )}
          </Link>
        )
      })}
    </SMobileNavBar>
  )
}
