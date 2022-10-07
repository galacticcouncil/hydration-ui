import { BasiliskIcon } from "assets/icons/tokens/BasiliskIcon"
import { ReactComponent as BasiliskLogo } from "assets/icons/BasiliskLogo.svg"
import { Icon } from "components/Icon/Icon"
import { MenuList } from "./MenuList/MenuList"
import { SHeader } from "./Header.styled"
import { useTranslation } from "react-i18next"
import { WalletConnectButton } from "sections/wallet/connect/modal/WalletConnectButton"

export const PageHeader = () => {
  const { t } = useTranslation("translation")

  const menuItems = [
    {
      text: t("header.trade"),
      active: false,
    },
    { text: t("header.pools"), active: true },
    { text: t("header.wallet"), active: false },
  ]

  return (
    <SHeader>
      <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
        <div sx={{ flex: "row", align: "center" }}>
          <Icon size={32} icon={<BasiliskIcon />} sx={{ mr: 11 }} />
          <Icon sx={{ mr: 60 }}>
            <BasiliskLogo />
          </Icon>
          <MenuList items={menuItems} />
        </div>

        <WalletConnectButton />
      </div>
    </SHeader>
  )
}
