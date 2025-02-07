import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { SAccountItem } from "@/components/Web3ConnectAccount.styled"
import { useAccount } from "@/hooks/useAccount"
import { Account } from "@/hooks/useWeb3Connect"
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
      data-active={isActive}
      data-proxy={isProxy}
      onClick={() => onSelect?.(account)}
    >
      <Flex align="center" gap={4}>
        {wallet && (
          <img
            loading="lazy"
            src={wallet.logo}
            alt={wallet.title}
            width={12}
            height={12}
          />
        )}
        <Text fs={14}>{account.name}</Text>
      </Flex>
      <Text fs={13} color={getToken("text.medium")}>
        {account.address}
      </Text>
    </SAccountItem>
  )
}
