import { useTranslation } from "react-i18next"
import { Icon } from "components/Icon/Icon"
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
      {MENU_ITEMS.map((item, index) => (
        <SNavBarItem key={index} active={item.active} href={item.href}>
          <Icon size={20} icon={getIcon(item.key)} />
          {t(item.translationKey)}
        </SNavBarItem>
      ))}
    </SMobileNavBar>
  )
}
