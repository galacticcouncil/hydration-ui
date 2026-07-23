import {
  AccountAvatar,
  Box,
  EditableText,
  Flex,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  formatCurrency,
  formatNumber,
  shortenAccountAddress,
} from "@galacticcouncil/utils"

import { AccountDeleteButton } from "@/components/account/AccountDeleteButton"
import {
  SAccountOption,
  SCopyButton,
} from "@/components/account/AccountOption.styled"
import { ProviderLogo } from "@/components/provider/ProviderLogo"
import { Account } from "@/hooks/useWeb3Connect"
import { getAccountAvatarTheme } from "@/utils"
import { getWallet } from "@/wallets"

export type AccountOptionProps = Account & {
  className?: string
  isActive?: boolean
  isProxy?: boolean
  isBalanceLoading?: boolean
  balanceSymbol?: string
  nameBadge?: React.ReactNode
  onSelect?: (account: Account) => void
  onEdit?: (name: string) => void
  onDelete?: () => void
}

export const AccountOption: React.FC<AccountOptionProps> = ({
  className,
  isActive,
  isProxy = false,
  balance,
  nameBadge,
  balanceSymbol,
  isBalanceLoading,
  onSelect,
  onEdit,
  onDelete,
  ...account
}) => {
  const wallet = getWallet(account.provider)

  return (
    <SAccountOption
      className={className}
      data-active={isActive}
      data-proxy={isProxy}
      {...(onSelect
        ? {
            onClick: () => onSelect(account),
          }
        : {
            disabled: true,
          })}
    >
      <Flex align="center" gap="m">
        <Box sx={{ flexShrink: 0 }}>
          <AccountAvatar
            address={account.displayAddress}
            theme={getAccountAvatarTheme(account)}
          />
        </Box>
        <Flex direction="column" width="100%" sx={{ minWidth: 0 }}>
          <Flex align="center" justify="space-between" height="l">
            <Flex align="center" gap="s" sx={{ minWidth: 0 }}>
              {wallet && <ProviderLogo size="xs" wallet={wallet} />}
              <EditableText
                fs="p3"
                value={account.name}
                disabled={!onEdit}
                truncate={200}
                onChange={(name) => onEdit?.(name)}
              />
              {nameBadge}
            </Flex>
            {isBalanceLoading && balance === undefined ? (
              <Skeleton sx={{ width: 75, ml: "auto" }} />
            ) : (
              balance !== undefined && (
                <Text fs="p3">
                  {balanceSymbol
                    ? `${formatNumber(balance)} ${balanceSymbol}`
                    : formatCurrency(balance)}
                </Text>
              )
            )}
          </Flex>
          <Flex align="center" justify="space-between" gap="s">
            <Text fs="p4" color={getToken("text.medium")} sx={{ minWidth: 0 }}>
              <Text as="span" truncate display={["none", "block"]}>
                {account.displayAddress}
              </Text>
              <Text as="span" display={["block", "none"]}>
                {shortenAccountAddress(account.displayAddress, 12)}
              </Text>
            </Text>
            <Flex pl="m" ml="auto" gap="base">
              <SCopyButton text={account.displayAddress} />
              {onDelete && <AccountDeleteButton onClick={onDelete} />}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </SAccountOption>
  )
}
