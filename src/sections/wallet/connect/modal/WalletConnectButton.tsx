import { WalletConnectModal } from "./WalletConnectModal"
import { SContainer, SLoginButton } from "./WalletConnectButton.styled"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { Account, useAccountStore } from "state/store"
import { ReactComponent as ChevronDownSmall } from "assets/icons/ChevronDownSmall.svg"
import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { BASILISK_ADDRESS_PREFIX } from "utils/api"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { theme } from "theme"
import { ButtonProps } from "components/Button/Button"
import { shortenAccountAddress } from "utils/formatting"

const WalletActiveButton = (props: {
  onOpen: () => void
  account: Account
  className?: string
}) => {
  const basiliskAddress = encodeAddress(
    decodeAddress(props.account.address),
    BASILISK_ADDRESS_PREFIX,
  )
  const kusamaAddress = props.account.address.toString()

  return (
    <SContainer className={props.className} onClick={props.onOpen}>
      <div sx={{ flex: "row", gap: 12, align: "center", justify: "center" }}>
        <div sx={{ flex: "column", gap: 4 }}>
          <Text color="neutralGray100" fs={14} lh={14} fw={700}>
            {props.account.name}
          </Text>
          <Text color="neutralGray300" fs={12} lh={12} fw={400}>
            {shortenAccountAddress(props.account.address.toString())}
          </Text>
        </div>
        <div
          sx={{
            flex: "row",
            align: "center",
            justify: "center",
            gap: 4,
            color: "neutralGray300",
          }}
        >
          <div>
            <AccountAvatar
              size={32}
              theme="substrate"
              address={basiliskAddress}
              css={{
                pointerEvents: "none",
                marginRight: -8,
              }}
            />
            <AccountAvatar
              size={32}
              theme={props.account.provider}
              address={kusamaAddress}
              css={{
                pointerEvents: "none",
                outline: `3px solid ${theme.colors.backgroundGray800}`,
                borderRadius: "9999px",
              }}
            />
          </div>
          <ChevronDownSmall />
        </div>
      </div>
    </SContainer>
  )
}

export const WalletInactiveButton = (props: {
  onOpen: () => void
  className?: string
  size?: ButtonProps["size"]
}) => {
  const { t } = useTranslation("translation")
  return (
    <SLoginButton
      size={props.size}
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
  const { account } = useAccountStore()
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
