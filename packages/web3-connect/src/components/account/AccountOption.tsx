import {
  AccountAvatar,
  Box,
  Flex,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { formatCurrency, shortenAccountAddress } from "@galacticcouncil/utils"
import { useState } from "react"

import { AccountDeleteButton } from "@/components/account/AccountDeleteButton"
import { AccountEditButton } from "@/components/account/AccountEditButton"
import { AccountNameEdit } from "@/components/account/AccountNameEdit"
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
  onSelect?: (account: Account) => void
  onEdit?: (name: string) => void
  onDelete?: () => void
}

export const AccountOption: React.FC<AccountOptionProps> = ({
  className,
  isActive,
  isProxy = false,
  balance,
  isBalanceLoading,
  onSelect,
  onEdit,
  onDelete,
  ...account
}) => {
  const [isEditing, setIsEditing] = useState(false)

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
      <Flex align="center" gap={12}>
        <Box sx={{ flexShrink: 0 }}>
          <AccountAvatar
            address={account.displayAddress}
            theme={getAccountAvatarTheme(account)}
          />
        </Box>
        <Flex direction="column" width="100%" sx={{ minWidth: 0 }}>
          <Flex align="center" justify="space-between">
            {isEditing ? (
              <AccountNameEdit
                name={account.name}
                onChange={(name) => {
                  onEdit?.(name)
                  setIsEditing(false)
                }}
                onCancel={() => setIsEditing(false)}
              />
            ) : (
              <Flex align="center" gap={4} sx={{ minWidth: 0 }}>
                {onDelete && <AccountDeleteButton onClick={onDelete} />}
                {wallet && <ProviderLogo size={12} wallet={wallet} />}
                <Text fs="p3" truncate={200}>
                  {account.name}
                </Text>
              </Flex>
            )}
            {isBalanceLoading && balance === undefined ? (
              <Skeleton sx={{ width: 75, ml: "auto" }} />
            ) : (
              balance !== undefined && (
                <Text fs="p3">{formatCurrency(balance)}</Text>
              )
            )}
            {onEdit && <AccountEditButton onClick={() => setIsEditing(true)} />}
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
            <SCopyButton text={account.displayAddress} />
          </Flex>
        </Flex>
      </Flex>
    </SAccountOption>
  )
}
