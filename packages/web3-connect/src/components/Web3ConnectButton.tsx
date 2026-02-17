import { CaretDown, Wallet } from "@galacticcouncil/ui/assets/icons"
import {
  AccountAvatar,
  Button,
  ButtonProps,
  Flex,
  Icon,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress, stringEquals } from "@galacticcouncil/utils"
import { FC, Ref } from "react"
import { useTranslation } from "react-i18next"

import { SConnectedButton } from "@/components/Web3ConnectButton.styled"
import { useWeb3Connect, WalletMode, WalletProviderStatus } from "@/hooks"
import { useAccount } from "@/hooks/useAccount"
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
  const { t } = useTranslation("translations", { i18n })
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
      <Button
        ref={ref}
        onClick={() => toggle(mode)}
        {...props}
        variant="accent"
        outline
      >
        <Icon size="m" component={Wallet} mr="s" />
        <Text fs="p3">{t("button.selectAccount")}</Text>
      </Button>
    )
  }

  if (account) {
    const shortDisplayAddr = shortenAccountAddress(account.displayAddress)

    return (
      <SConnectedButton
        ref={ref}
        onClick={() => toggle(mode)}
        {...props}
        variant="tertiary"
        sx={{ px: 10, gap: "base" }}
      >
        <AccountAvatar
          size={24}
          address={account.displayAddress}
          theme={getAccountAvatarTheme(account)}
        />
        <Flex direction="column">
          <Text fs="p3" lh={1.2} truncate={140}>
            {account.name}
          </Text>
          {!stringEquals(account.name, shortDisplayAddr) && (
            <Text fs="p6" color={getToken("text.medium")}>
              {shortDisplayAddr}
            </Text>
          )}
        </Flex>
        <Icon size={8} component={CaretDown} />
      </SConnectedButton>
    )
  }

  return (
    <Button ref={ref} onClick={() => toggle(mode)} {...props}>
      <Icon size="m" component={Wallet} mr="s" />
      <Text fs="p3">{t("button.connect")}</Text>
    </Button>
  )
}
