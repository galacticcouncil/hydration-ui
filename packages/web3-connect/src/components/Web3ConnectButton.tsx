import { CaretDown, Wallet } from "@galacticcouncil/ui/assets/icons"
import { ButtonProps, Flex, Icon } from "@galacticcouncil/ui/components"
import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { forwardRef } from "react"

import {
  SConnectedButton,
  SDisconnectedButton,
} from "@/components/Web3ConnectButton.styled"
import { useAccount } from "@/hooks/useAccount"
import { useWeb3ConnectModal } from "@/hooks/useWeb3ConnectModal"
import { getWallet } from "@/wallets"

export const Web3ConnectButton: React.FC<ButtonProps> = forwardRef(
  (props, ref) => {
    const { account } = useAccount()
    const { toggle } = useWeb3ConnectModal()
    if (account) {
      const wallet = getWallet(account.provider)
      return (
        <SDisconnectedButton
          ref={ref}
          size="large"
          variant="tertiary"
          onClick={toggle}
          {...props}
        >
          {wallet && (
            <img
              src={wallet.logo}
              alt={wallet.title}
              width={24}
              height={24}
              sx={{ ml: -20, mr: 4 }}
            />
          )}
          <Flex direction="column">
            <Text fs="p3" lh={1.2}>
              {account.name}
            </Text>
            <Text fs="p6" color={getToken("text.medium")}>
              {shortenAccountAddress(account.address)}
            </Text>
          </Flex>
          <Icon size={8} component={CaretDown} sx={{ mr: -20, ml: 8 }} />
        </SDisconnectedButton>
      )
    }

    return (
      <SConnectedButton
        ref={ref}
        size="large"
        variant="secondary"
        onClick={toggle}
        {...props}
      >
        <Icon size={16} component={Wallet} ml={-8} mr={4} />
        <Text fs="p3">Connect Wallet</Text>
      </SConnectedButton>
    )
  },
)

Web3ConnectButton.displayName = "Web3ConnectButton"
