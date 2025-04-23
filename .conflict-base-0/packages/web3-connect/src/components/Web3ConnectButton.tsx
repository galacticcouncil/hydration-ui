import { CaretDown, Wallet } from "@galacticcouncil/ui/assets/icons"
import { ButtonProps, Flex, Icon } from "@galacticcouncil/ui/components"
import { Text } from "@galacticcouncil/ui/components"
import { Button } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { forwardRef } from "react"

import { SConnectedButton } from "@/components/Web3ConnectButton.styled"
import { useAccount } from "@/hooks/useAccount"
import { useWeb3ConnectModal } from "@/hooks/useWeb3ConnectModal"
import { getWallet } from "@/wallets"

export const Web3ConnectButton = forwardRef<HTMLButtonElement, ButtonProps>(
  (props, ref) => {
    const { account } = useAccount()
    const { toggle } = useWeb3ConnectModal()
    if (account) {
      const wallet = getWallet(account.provider)
      return (
        <SConnectedButton
          ref={ref}
          onClick={() => toggle()}
          {...props}
          variant="tertiary"
          sx={{ px: 10, gap: 8 }}
        >
          {wallet && (
            <img src={wallet.logo} alt={wallet.title} width={24} height={24} />
          )}
          <Flex direction="column">
            <Text fs="p3" lh={1.2}>
              {account.name}
            </Text>
            <Text fs="p6" color={getToken("text.medium")}>
              {shortenAccountAddress(account.address)}
            </Text>
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
