import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import ChevronDownSmall from "assets/icons/ChevronDownSmall.svg?react"
import WalletIcon from "assets/icons/Wallet.svg?react"
import { AccountAvatar } from "components/AccountAvatar/AccountAvatar"
import { ButtonProps } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import {
  Account,
  useWeb3ConnectStore,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { HYDRA_ADDRESS_PREFIX } from "utils/api"
import { safeConvertAddressSS58, shortenAccountAddress } from "utils/formatting"
import { SContainer, SLoginButton } from "./Web3ConnectModalButton.styled"

const Web3ConnectActiveButton: FC<{
  onOpen: () => void
  account: Account
  className?: string
}> = ({ account, onOpen, className }) => {
  const hydraAddress = encodeAddress(
    decodeAddress(account.address),
    HYDRA_ADDRESS_PREFIX,
  )

  const evmAddress = account.evmAddress
  const polkadotAddress = account.address

  const shortenedAddress = !!evmAddress
    ? shortenAccountAddress(evmAddress)
    : shortenAccountAddress(
        safeConvertAddressSS58(polkadotAddress, HYDRA_ADDRESS_PREFIX) ?? "",
      )

  const shouldRenderSecondaryAvatar =
    !account.isExternalWalletConnected && !evmAddress

  const shouldHideAddress = account.name === shortenedAddress?.toLowerCase()

  return (
    <SContainer className={className} onClick={onOpen}>
      <div sx={{ flex: "row", gap: 12, align: "center", justify: "center" }}>
        <div sx={{ flex: "column", gap: 4 }}>
          <Text color="basic100" fs={14} lh={14} font="ChakraPetchBold">
            {account.name}
          </Text>
          {!shouldHideAddress && (
            <Text color="basic300" fs={12} lh={12} fw={400}>
              {shortenedAddress}
            </Text>
          )}
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
            {shouldRenderSecondaryAvatar && (
              <AccountAvatar
                size={32}
                theme="substrate"
                address={hydraAddress}
                css={{
                  pointerEvents: "none",
                  marginRight: -8,
                }}
              />
            )}
            <AccountAvatar
              size={32}
              theme={account.provider}
              address={evmAddress || polkadotAddress}
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

export const Web3ConnectInactiveButton: FC<{
  onOpen: () => void
  className?: string
  size?: ButtonProps["size"]
}> = (props) => {
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

export const Web3ConnectModalButton: FC<{ className?: string }> = (props) => {
  const { toggle } = useWeb3ConnectStore()
  const { account } = useAccount()

  return (
    <>
      {account ? (
        <Web3ConnectActiveButton
          className={props.className}
          account={account}
          onOpen={toggle}
        />
      ) : (
        <Web3ConnectInactiveButton
          className={props.className}
          onOpen={toggle}
        />
      )}
    </>
  )
}
