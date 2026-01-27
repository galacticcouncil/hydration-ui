import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Grid,
  Input,
  ModalBody,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { useCallback, useMemo, useState } from "react"
import { useDebounce } from "react-use"
import { pick, prop } from "remeda"
import { useShallow } from "zustand/react/shallow"

import {
  AccountFilter,
  AccountFilterOption,
} from "@/components/account/AccountFilter"
import { AccountMetaMaskOption } from "@/components/account/AccountMetaMaskOption"
import { AccountOption } from "@/components/account/AccountOption"
import {
  getFilteredAccounts,
  useAccountsWithBalance,
} from "@/components/content/AccountSelectContent.utils"
import { ProviderLoader } from "@/components/provider/ProviderLoader"
import { WalletProviderType } from "@/config/providers"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useAccount } from "@/hooks/useAccount"
import { Account, useWeb3Connect, WalletMode } from "@/hooks/useWeb3Connect"
import { getDefaultAccountFilterByMode, toAccount } from "@/utils"

const getAccountOptionComponent = (account: Account) => {
  switch (account.provider) {
    case WalletProviderType.MetaMask:
      return AccountMetaMaskOption
    default:
      return AccountOption
  }
}

export const AccountSelectContent = () => {
  const { account: currentAccount } = useAccount()
  const { onAccountSelect, isControlled, mode } = useWeb3ConnectContext()
  const { accounts, toggle, getProviders } = useWeb3Connect(
    useShallow(pick(["accounts", "toggle", "getProviders"])),
  )

  const isDefaultMode = mode === WalletMode.Default

  const [filter, setFilter] = useState<AccountFilterOption>(
    getDefaultAccountFilterByMode(mode),
  )
  const [searchVal, setSearchVal] = useState("")
  const [search, setSearch] = useState("")
  useDebounce(
    () => {
      setSearch(searchVal ?? "")
    },
    100,
    [searchVal],
  )

  const providers = getProviders(mode)
  const isProvidersConnecting = providers.some(
    ({ status }) => status === "pending",
  )

  const accountList = useMemo(
    () =>
      getFilteredAccounts(
        accounts.map(toAccount),
        currentAccount,
        search,
        filter,
      ),
    [accounts, currentAccount, filter, search],
  )

  const hasNoResults = accountList.length === 0

  const handleAccountSelect = useCallback(
    (account: Account) => {
      onAccountSelect(account)
      if (!isControlled) {
        toggle()
      }
    },
    [isControlled, onAccountSelect, toggle],
  )

  const shouldRenderSearch = accounts.length > 1
  const shouldRenderHeader =
    !isProvidersConnecting && (isDefaultMode || shouldRenderSearch)

  const { accountsWithBalances, areBalancesLoading } =
    useAccountsWithBalance(accountList)

  return (
    <>
      <ModalHeader
        title="Select account"
        align="center"
        customHeader={
          shouldRenderHeader && (
            <Flex direction="column" gap={20} mt={10}>
              {shouldRenderSearch && (
                <Input
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  customSize="large"
                  iconStart={Search}
                  placeholder="Search by name or paste address"
                />
              )}
              {isDefaultMode && (
                <AccountFilter
                  active={filter}
                  onSetActive={(mode) => setFilter(mode)}
                />
              )}
            </Flex>
          )
        }
      />
      <ModalBody>
        <Grid gap={10}>
          {isProvidersConnecting ? (
            <ProviderLoader providers={providers.map(prop("type"))} />
          ) : (
            <>
              {hasNoResults && <Text>No accounts found</Text>}
              {accountsWithBalances.map((account) => {
                const Component = getAccountOptionComponent(account)
                return (
                  <Component
                    key={`${account.publicKey}-${account.provider}`}
                    {...account}
                    isBalanceLoading={areBalancesLoading}
                    onSelect={handleAccountSelect}
                  />
                )
              })}
            </>
          )}
        </Grid>
      </ModalBody>
    </>
  )
}
