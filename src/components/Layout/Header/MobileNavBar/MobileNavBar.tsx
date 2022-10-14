import { useTranslation } from "react-i18next"

import { Icon } from "components/Icon/Icon"
import { ReactComponent as PoolsAndFarms } from "assets/icons/PoolsAndFarms.svg"
import { ReactComponent as Trade } from "assets/icons/Trade.svg"
import { ReactComponent as Wallet } from "assets/icons/Wallet.svg"
import { ReactComponent as Minus } from "assets/icons/FailIcon.svg"
import { MENU_ITEMS, TabKeys } from "utils/tabs"
import { SMobileNavBar, SNavBarItem } from "./MobileNavBar.styled"

export const MobileNavBar = () => {
  const { t } = useTranslation("translation")

  const getIcon = (name: TabKeys) => {
    if (name === "trade") return <Trade />
    if (name === "pools") return <PoolsAndFarms />
    if (name === "wallet") return <Wallet />
    // TODO: add missing icons in Figma
    return <Minus />
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
