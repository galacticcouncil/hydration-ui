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
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { SConnectedButton } from "@/components/Web3ConnectButton.styled"
import { useWeb3Connect, WalletProviderStatus } from "@/hooks"
import { useAccount } from "@/hooks/useAccount"
import { useWeb3ConnectModal } from "@/hooks/useWeb3ConnectModal"
import { getAccountAvatarTheme } from "@/utils"

export type Web3ConnectButtonProps = ButtonProps & {
  allowIncompatibleAccounts?: boolean
}

export const Web3ConnectButton: FC<
  Web3ConnectButtonProps & { ref?: Ref<HTMLButtonElement> }
> = ({ ref, allowIncompatibleAccounts = false, ...props }) => {
  const { account } = useAccount()
  const { toggle } = useWeb3ConnectModal()
  const { providers } = useWeb3Connect(useShallow(pick(["providers"])))

  const connectedProviders = providers.filter(
    (provider) => provider.status === WalletProviderStatus.Connected,
  )

  const isIncompatible = !allowIncompatibleAccounts && !!account?.isIncompatible
  const isConnectedWithoutAccount = connectedProviders.length > 0 && !account

  if (isIncompatible || isConnectedWithoutAccount) {
    return (
      <Button
        ref={ref}
        onClick={() => toggle()}
        {...props}
        variant="accent"
        outline
      >
        <Icon size={16} component={Wallet} mr={4} />
        <Text fs="p3">Select Account</Text>
      </Button>
    )
  }

  if (account) {
    const shortDisplayAddr = shortenAccountAddress(account.displayAddress)

    return (
      <SConnectedButton
        ref={ref}
        onClick={() => toggle()}
        {...props}
        variant="tertiary"
        sx={{ px: 10, gap: 8 }}
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
    <Button ref={ref} onClick={() => toggle()} {...props}>
      <Icon size={16} component={Wallet} mr={4} />
      <Text fs="p3">Connect Wallet</Text>
    </Button>
  )
}
