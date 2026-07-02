import { CaretDown, Wallet } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  ButtonProps,
  Chip,
  Flex,
  Icon,
  Image,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress, stringEquals } from "@galacticcouncil/utils"
import { FC, Ref } from "react"
import { useTranslation } from "react-i18next"

import { AccountAddressBookIdentity } from "@/components/account/AccountIdentity"
import { SConnectedButton } from "@/components/Web3ConnectButton.styled"
import { WalletProviderType } from "@/config/providers"
import {
  type Account,
  useWeb3Connect,
  WalletMode,
  WalletProviderStatus,
} from "@/hooks"
import { useAccount } from "@/hooks/useAccount"
import { useActiveMultisigConfig } from "@/hooks/useMultisigConfigs"
import { useWeb3ConnectModal } from "@/hooks/useWeb3ConnectModal"
import i18n from "@/i18n"
import { getWallet } from "@/wallets"

export type Web3ConnectButtonProps = ButtonProps & {
  allowIncompatibleAccounts?: boolean
  mode?: WalletMode
  hideCaret?: boolean
}

export const Web3ConnectButton: FC<
  Web3ConnectButtonProps & { ref?: Ref<HTMLButtonElement> }
> = ({
  ref,
  allowIncompatibleAccounts = false,
  mode,
  hideCaret = false,
  ...props
}) => {
  const { account } = useAccount()
  const { toggle } = useWeb3ConnectModal()

  const isConnectedWithoutAccount = useWeb3Connect((state) => {
    const hasConnectedProvider = state.providers.some(
      (p) => p.status === WalletProviderStatus.Connected,
    )
    return hasConnectedProvider && !state.account
  })

  const isIncompatible = !allowIncompatibleAccounts && !!account?.isIncompatible

  if (isIncompatible || isConnectedWithoutAccount) {
    return (
      <SelectAccountButton ref={ref} onClick={() => toggle(mode)} {...props} />
    )
  }

  if (account) {
    return (
      <ConnectedAccountButton
        ref={ref}
        onClick={() => toggle(mode)}
        account={account}
        hideCaret={hideCaret}
        {...props}
      />
    )
  }

  return (
    <ConnectWalletButton ref={ref} onClick={() => toggle(mode)} {...props} />
  )
}

type ConnectButtonProps = ButtonProps & {
  ref?: Ref<HTMLButtonElement>
}

const SelectAccountButton: FC<ConnectButtonProps> = ({
  ref,
  onClick,
  ...props
}) => {
  const { t } = useTranslation("translations", { i18n })
  return (
    <Button ref={ref} onClick={onClick} {...props} variant="accent" outline>
      <Icon size="m" component={Wallet} mr="s" />
      <Text fs="p3">{t("button.selectAccount")}</Text>
    </Button>
  )
}

const ConnectWalletButton: FC<ConnectButtonProps> = ({
  ref,
  onClick,
  ...props
}) => {
  const { t } = useTranslation("translations", { i18n })
  return (
    <Button ref={ref} onClick={onClick} {...props}>
      <Icon size="m" component={Wallet} mr="s" />
      <Text fs="p3">{t("button.connect")}</Text>
    </Button>
  )
}

type ConnectedMultisigAccountButtonProps = ConnectButtonProps & {
  account: Account
  hideCaret?: boolean
}

const ConnectedAccountButton: React.FC<ConnectedMultisigAccountButtonProps> = ({
  ref,
  onClick,
  account,
  hideCaret = false,
  ...props
}) => {
  const { t } = useTranslation("translations", { i18n })
  const activeMultisigConfig = useActiveMultisigConfig()

  const signerLabel =
    account.isMultisig && activeMultisigConfig
      ? `(${activeMultisigConfig.threshold}/${activeMultisigConfig.signers.length})`
      : ""

  const shortDisplayAddr = !account.isMultisig
    ? shortenAccountAddress(account.displayAddress)
    : ""
  const isExternalWallet =
    account.provider === WalletProviderType.ExternalWallet
  const connectedWallet = getWallet(account.provider)

  return (
    <SConnectedButton
      ref={ref}
      onClick={onClick}
      {...props}
      data-web3-connect-connected-button="true"
      variant="tertiary"
    >
      {connectedWallet ? (
        <Image
          src={connectedWallet.logo}
          alt={connectedWallet.title}
          sx={{ size: 24, borderRadius: "full", flexShrink: 0 }}
        />
      ) : (
        <Icon size={24} component={Wallet} />
      )}
      <Flex direction="column">
        <Flex gap="xs" align="flex-end">
          {isExternalWallet ? (
            <Text fs="p4" lh={1.2} truncate={pxToRem(140)}>
              {account.name}
            </Text>
          ) : (
            <Text fs="p4" lh={1.2} truncate={pxToRem(140)}>
              {account.name}
            </Text>
          )}
          {signerLabel && (
            <Chip variant="green" size="extra-small">
              {signerLabel}
            </Chip>
          )}
        </Flex>
        {account.multisigSignerAddress ? (
          <Text fs="p6" color={getToken("text.medium")}>
            {t("button.multisig.signingAs")}{" "}
            <AccountAddressBookIdentity
              as="span"
              address={account.multisigSignerAddress}
            />
          </Text>
        ) : (
          shortDisplayAddr &&
          !stringEquals(account.name, shortDisplayAddr) && (
            <Text fs="p6" color={getToken("text.medium")}>
              {shortDisplayAddr}
            </Text>
          )
        )}
      </Flex>
      {!hideCaret && <Icon size={pxToRem(8)} component={CaretDown} />}
    </SConnectedButton>
  )
}
