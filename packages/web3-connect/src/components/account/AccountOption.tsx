import { CheckIcon, CopyIcon } from "@galacticcouncil/ui/assets/icons"
import {
  AccountAvatar,
  Box,
  Flex,
  Icon,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { shortenAccountAddress, useCopy } from "@galacticcouncil/utils"

import {
  SAccountOption,
  SCopyButton,
} from "@/components/account/AccountOption.styled"
import { ProviderLogo } from "@/components/provider/ProviderLogo"
import { useAccount } from "@/hooks/useAccount"
import { Account } from "@/hooks/useWeb3Connect"
import { getAccountAvatarTheme } from "@/utils"
import { getWallet } from "@/wallets"

export type AccountOptionProps = Account & {
  isProxy?: boolean
  balance?: string
  onSelect?: (account: Account) => void
}

export const AccountOption: React.FC<AccountOptionProps> = ({
  isProxy = false,
  onSelect,
  ...account
}) => {
  const { account: currentAccount } = useAccount()
  const wallet = getWallet(account.provider)

  const { copied, copy } = useCopy(5000)

  const isActive =
    currentAccount?.address === account.address &&
    currentAccount?.provider === account.provider

  return (
    <SAccountOption
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
        <Flex direction="column" width="100%" sx={{ minWidth: 0 }}>
          <Flex align="center" gap={4}>
            {wallet && <ProviderLogo size={12} wallet={wallet} />}
            <Text fs="p3" truncate>
              {account.name}
            </Text>
          </Flex>
          <Flex align="center" justify="space-between" gap={4}>
            <Text fs="p4" color={getToken("text.medium")}>
              <Text as="span" display={["none", "block"]}>
                {account.displayAddress}
              </Text>
              <Text as="span" display={["block", "none"]}>
                {shortenAccountAddress(account.displayAddress, 12)}
              </Text>
            </Text>
            <SCopyButton
              copied={copied}
              disabled={copied}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                copy(account.displayAddress)
              }}
            >
              <Icon size={14} component={copied ? CheckIcon : CopyIcon} />
            </SCopyButton>
          </Flex>
        </Flex>
      </Flex>
    </SAccountOption>
  )
}
