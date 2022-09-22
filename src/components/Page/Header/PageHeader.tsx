import { BasiliskIcon } from "assets/icons/tokens/BasiliskIcon"
import { ReactComponent as BasiliskLogo } from "assets/icons/BasiliskLogo.svg"
import { Box } from "components/Box/Box"
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
      <Box flex spread acenter>
        <Box flex acenter>
          <Icon size={32} mr={11} icon={<BasiliskIcon />} />
          <Icon height={21} mr={60}>
            <BasiliskLogo />
          </Icon>
          <MenuList items={menuItems} />
        </Box>

        <WalletConnectButton />
      </Box>
    </SHeader>
  )
}
