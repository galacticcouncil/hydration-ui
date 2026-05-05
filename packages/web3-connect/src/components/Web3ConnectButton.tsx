import { CaretDown, Wallet } from "@galacticcouncil/ui/assets/icons"
import {
  AccountAvatar,
  Button,
  ButtonProps,
  Chip,
  Flex,
  Icon,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, pxToRem } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress, stringEquals } from "@galacticcouncil/utils"
import { FC, Ref } from "react"
import { useTranslation } from "react-i18next"

import { AccountAddressBookIdentity } from "@/components/account/AccountIdentity"
import {
  SConnectedButton,
  SHoverText,
} from "@/components/Web3ConnectButton.styled"
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
import { getAccountAvatarTheme } from "@/utils"

export type Web3ConnectButtonProps = ButtonProps & {
  allowIncompatibleAccounts?: boolean
  mode?: WalletMode
}

export const Web3ConnectButton: FC<
  Web3ConnectButtonProps & { ref?: Ref<HTMLButtonElement> }
> = ({ ref, allowIncompatibleAccounts = false, mode, ...props }) => {
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
}

const ConnectedAccountButton: React.FC<ConnectedMultisigAccountButtonProps> = ({
  ref,
  onClick,
  account,
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

  return (
    <SConnectedButton ref={ref} onClick={onClick} {...props} variant="tertiary">
      <AccountAvatar
        size={24}
        address={account.displayAddress}
        theme={getAccountAvatarTheme(account)}
      />
      <Flex direction="column">
        <Flex gap="xs" align="flex-end">
          <Text fs="p3" lh={1.2} truncate={pxToRem(140)}>
            {account.name}
          </Text>
          {signerLabel && (
            <Chip variant="green" size="extra-small">
              {signerLabel}
            </Chip>
          )}
        </Flex>
        {account.multisigSignerAddress ? (
          <SHoverText fs="p6" color={getToken("text.medium")}>
            <Text as="span">
              {t("button.multisig.signingAs")}{" "}
              <AccountAddressBookIdentity
                as="span"
                address={account.multisigSignerAddress}
              />
            </Text>
            <Text as="span">
              {shortenAccountAddress(account.multisigSignerAddress)}
            </Text>
          </SHoverText>
        ) : (
          shortDisplayAddr &&
          !stringEquals(account.name, shortDisplayAddr) && (
            <Text fs="p6" color={getToken("text.medium")}>
              {shortDisplayAddr}
            </Text>
          )
        )}
      </Flex>
      <Icon size={pxToRem(8)} component={CaretDown} />
    </SConnectedButton>
  )
}
