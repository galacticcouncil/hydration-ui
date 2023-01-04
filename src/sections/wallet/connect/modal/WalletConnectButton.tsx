import { useState } from "react"
import { useTranslation } from "react-i18next"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"

import { Text } from "components/Typography/Text/Text"
import { ReactComponent as ChevronDownSmall } from "assets/icons/ChevronDownSmall.svg"
import { ReactComponent as WalletIcon } from "assets/icons/Wallet.svg"
import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { ButtonProps } from "components/Button/Button"
import { HYDRA_ADDRESS_PREFIX } from "utils/api"
import { Account, useAccountStore } from "state/store"
import { safeConvertAddressSS58, shortenAccountAddress } from "utils/formatting"

import { WalletConnectModal } from "./WalletConnectModal"
import { SContainer, SLoginButton } from "./WalletConnectButton.styled"

const WalletActiveButton = (props: {
  onOpen: () => void
  account: Account
  className?: string
}) => {
  const hydraAddress = encodeAddress(
    decodeAddress(props.account.address),
    HYDRA_ADDRESS_PREFIX,
  )
  const polkadotAddress = props.account.address.toString()

  return (
    <SContainer className={props.className} onClick={props.onOpen}>
      <div sx={{ flex: "row", gap: 12, align: "center", justify: "center" }}>
        <div sx={{ flex: "column", gap: 4 }}>
          <Text color="basic100" fs={14} lh={14} font="ChakraPetchBold">
            {props.account.name}
          </Text>
          <Text color="basic300" fs={12} lh={12} fw={400}>
            {shortenAccountAddress(
              safeConvertAddressSS58(
                props.account.address.toString(),
                HYDRA_ADDRESS_PREFIX,
              ) ?? "",
            )}
          </Text>
        </div>
        <div
          sx={{
            flex: "row",
            align: "center",
            justify: "center",
            gap: 4,
          }}
        >
          <div>
            <AccountAvatar
              size={32}
              theme="substrate"
              address={hydraAddress}
              css={{
                pointerEvents: "none",
                marginRight: -8,
              }}
            />
            <AccountAvatar
              size={32}
              theme={props.account.provider}
              address={polkadotAddress}
              css={{
                pointerEvents: "none",
                borderRadius: "9999px",
              }}
            />
          </div>
          <ChevronDownSmall sx={{ color: "basic100" }} />
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
      transform="none"
    >
      <WalletIcon />
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
