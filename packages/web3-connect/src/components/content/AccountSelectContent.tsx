import { isEvmAccount } from "@galacticcouncil/sdk"
import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Grid,
  Input,
  ModalBody,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { isSS58Address } from "@galacticcouncil/utils"
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
import { useAccount } from "@/hooks/useAccount"
import { Account, useWeb3Connect, WalletMode } from "@/hooks/useWeb3Connect"
import { toAccount } from "@/utils"
import { getWallet } from "@/wallets"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

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
  const { accounts, setAccount, toggle, getConnectedProviders } =
    useWeb3Connect(
      useShallow(
        pick(["accounts", "setAccount", "toggle", "getConnectedProviders"]),
      ),
    )

  const [filter, setFilter] = useState<AccountFilterOption>(WalletMode.Default)
  const [searchVal, setSearchVal] = useState("")
  const [search, setSearch] = useState("")
  useDebounce(
    () => {
      setSearch(searchVal ?? "")
    },
    100,
    [searchVal],
  )

  const providers = getConnectedProviders()
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

  const onAccountSelect = useCallback(
    (account: Account) => {
      setAccount(account)
      toggle()

      const wallet = getWallet(account.provider)
      if (wallet instanceof BaseSubstrateWallet) {
        wallet.setSigner(account.address)
      }
    },
    [setAccount, toggle],
  )

  const groups = Object.groupBy(accountList, (acc) => {
    if (isEvmAccount(acc.address)) {
      return WalletMode.EVM
    }

    if (isSS58Address(acc.address)) {
      return WalletMode.Substrate
    }

    return WalletMode.Unknown
  })

  const groupCount = Object.keys(groups).length ?? 0
  const shouldRenderFilter = groupCount > 1 || filter !== WalletMode.Default
  const shouldRenderSearch = accounts.length > 1
  const shouldRenderHeader =
    !isProvidersConnecting && (shouldRenderFilter || shouldRenderSearch)

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
              {shouldRenderFilter && (
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
                    onSelect={onAccountSelect}
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
