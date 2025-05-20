import { AccountAvatar, Box, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress } from "@galacticcouncil/utils"

import { SAccountItem } from "@/components/Web3ConnectAccount.styled"
import { Web3WalletLogo } from "@/components/Web3WalletLogo"
import { useAccount } from "@/hooks/useAccount"
import { Account } from "@/hooks/useWeb3Connect"
import { getAccountAvatarTheme } from "@/utils"
import { getWallet } from "@/wallets"

export type Web3ConnectAccountProps = Account & {
  isProxy?: boolean
  balance?: string
  onSelect?: (account: Account) => void
}

export const Web3ConnectAccount: React.FC<Web3ConnectAccountProps> = ({
  isProxy = false,
  onSelect,
  ...account
}) => {
  const { account: currentAccount } = useAccount()
  const wallet = getWallet(account.provider)

  const isActive =
    currentAccount?.address === account.address &&
    currentAccount?.provider === account.provider

  return (
    <SAccountItem
      type="button"
      data-active={isActive}
      data-proxy={isProxy}
      onClick={() => onSelect?.(account)}
    >
      <Flex align="center" gap={12}>
        <Box sx={{ flexShrink: 0 }}>
          <AccountAvatar
            address={account.displayAddress}
            theme={getAccountAvatarTheme(account)}
          />
        </Box>
        <Flex direction="column" sx={{ minWidth: 0 }}>
          <Flex align="center" gap={4}>
            {wallet && <Web3WalletLogo size={12} wallet={wallet} />}
            <Text fs="p3" truncate>
              {account.name}
            </Text>
          </Flex>
          <Text fs="p4" color={getToken("text.medium")}>
            <Text as="span" display={["none", "block"]}>
              {account.displayAddress}
            </Text>
            <Text as="span" display={["block", "none"]}>
              {shortenAccountAddress(account.displayAddress, 12)}
            </Text>
          </Text>
        </Flex>
      </Flex>
    </SAccountItem>
  )
}
