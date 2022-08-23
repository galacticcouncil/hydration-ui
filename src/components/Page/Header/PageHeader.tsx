import { css } from "styled-components"
import { BasiliskIcon } from "assets/icons/tokens/BasiliskIcon"
import { BasiliskLogo } from "assets/icons/BasiliskLogo"
import { Box } from "components/Box/Box"
import { Icon } from "components/Icon/Icon"
import { MenuList } from "./MenuList/MenuList"
import { SLoginButton, SHeader } from "./Header.styled"
import { useState } from "react"
import { WalletConnectModal } from "sections/wallet/connect/modal/WalletConnectModal"
import { useTranslation } from "react-i18next"
import { useStore } from "state/store"
import { Text } from "components/Typography/Text/Text"
import { shortenAccountAddress } from "utils/account"

export const PageHeader = () => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation("translation")
  const { account } = useStore()

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

        {account ? (
          <Box
            bg="backgroundGray1000"
            css={css`
              border-radius: 13px;
              padding: 8px 14px;
            `}
          >
            <Box flex column gap={4}>
              <Text color="neutralGray100" fs={14} fw={700}>
                AccountName
              </Text>
              <Text color="neutralGray300" fs={12} fw={400}>
                {shortenAccountAddress(account)}
              </Text>
            </Box>
          </Box>
        ) : (
          <Box>
            <SLoginButton variant="gradient" onClick={() => setOpen(true)}>
              {t("header.walletConnect.button")}
            </SLoginButton>

            <WalletConnectModal isOpen={open} onClose={() => setOpen(false)} />
          </Box>
        )}
      </Box>
    </SHeader>
  )
}
