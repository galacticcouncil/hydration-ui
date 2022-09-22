import { WalletConnectModal } from "./WalletConnectModal"
import { SContainer, SLoginButton } from "./WalletConnectButton.styled"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Box } from "components/Box/Box"
import { css } from "styled-components"
import { theme } from "theme"
import { Text } from "components/Typography/Text/Text"
import { Account, useStore } from "state/store"
import { shortenAccountAddress } from "utils/account"
import { ReactComponent as ChevronDownSmall } from "assets/icons/ChevronDownSmall.svg"
import Identicon from "@polkadot/react-identicon"

const WalletActiveButton = (props: {
  onOpen: () => void
  account: Account
  className?: string
}) => {
  return (
    <SContainer className={props.className} onClick={props.onOpen}>
      <Box
        flex
        gap={12}
        css={css`
          align-items: center;
          justify-content: center;
        `}
      >
        <Box flex column gap={4}>
          <Text color="neutralGray100" fs={14} lh={14} fw={700}>
            {props.account.name}
          </Text>
          <Text color="neutralGray300" fs={12} lh={12} fw={400}>
            {shortenAccountAddress(props.account.address.toString())}
          </Text>
        </Box>
        <Box
          flex
          css={css`
            align-items: center;
            justify-content: center;
            gap: 2px;
            color: ${theme.colors.neutralGray300};
          `}
        >
          <Identicon
            size={32}
            value={props.account.address.toString()}
            css={css`
              pointer-events: none;
            `}
          />
          <ChevronDownSmall />
        </Box>
      </Box>
    </SContainer>
  )
}

const WalletInactiveButton = (props: {
  onOpen: () => void
  className?: string
}) => {
  const { t } = useTranslation("translation")
  return (
    <SLoginButton
      variant="gradient"
      onClick={props.onOpen}
      className={props.className}
    >
      {t("header.walletConnect.button")}
    </SLoginButton>
  )
}

export const WalletConnectButton = (props: { className?: string }) => {
  const [open, setOpen] = useState(false)
  const { account } = useStore()
  return (
    <>
      {account ? (
        <WalletActiveButton
          className={props.className}
          account={account}
          onOpen={() => setOpen(true)}
        />
      ) : (
        <WalletInactiveButton
          className={props.className}
          onOpen={() => setOpen(true)}
        />
      )}
      <WalletConnectModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
