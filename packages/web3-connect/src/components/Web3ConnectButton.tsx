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
import { forwardRef } from "react"

import { SConnectedButton } from "@/components/Web3ConnectButton.styled"
import { useAccount } from "@/hooks/useAccount"
import { useWeb3ConnectModal } from "@/hooks/useWeb3ConnectModal"
import { getAccountAvatarTheme } from "@/utils"

export const Web3ConnectButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { account } = useAccount()
    const { toggle } = useWeb3ConnectModal()
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
        <Icon size={16} component={Wallet} ml={-8} mr={4} />
        <Text fs="p3">Connect Wallet</Text>
      </Button>
    )
  },
)

Web3ConnectButton.displayName = "Web3ConnectButton"
