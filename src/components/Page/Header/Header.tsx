import { BasiliskIcon } from "assets/icons/tokens/BasiliskIcon"
import { BasiliskLogo } from "assets/icons/BasiliskLogo"
import { Box } from "components/Box/Box"
import { Icon } from "components/Icon/Icon"
import { MenuList } from "./MenuList/MenuList"
import { StyledLoginButton, StyledHeader } from "./Header.styled"
import { useState } from "react"

import { WalletConnectModal } from "pages/WalletConnectModal/WalletConnectModal"
import { useTranslation } from "react-i18next"

export const Header = () => {
  const [open, setOpen] = useState(false)
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
    <StyledHeader>
      <Box flex spread acenter>
        <Box flex acenter>
          <Icon size={32} mr={11} icon={<BasiliskIcon />} />
          <Icon height={21} mr={60}>
            <BasiliskLogo />
          </Icon>
          <MenuList items={menuItems} />
        </Box>

        <Box>
          <StyledLoginButton variant="gradient" onClick={() => setOpen(true)}>
            {t("header.walletConnect.button")}
          </StyledLoginButton>

          <WalletConnectModal isOpen={open} onClose={() => setOpen(false)} />
        </Box>
      </Box>
    </StyledHeader>
  )
}
