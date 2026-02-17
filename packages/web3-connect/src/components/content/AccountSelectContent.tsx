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
import { useTranslation } from "react-i18next"
import { useDebounce } from "react-use"
import { pick, prop } from "remeda"
import { useShallow } from "zustand/react/shallow"

import {
  AccountFilter,
  AccountFilterOption,
} from "@/components/account/AccountFilter"
import { AccountMetaMaskOption } from "@/components/account/AccountMetaMaskOption"
import { AccountOption } from "@/components/account/AccountOption"
import { AccountSolanaOption } from "@/components/account/AccountSolanaOption"
import { AccountSuiOption } from "@/components/account/AccountSuiOption"
import {
  getFilteredAccounts,
  useAccountsWithBalance,
} from "@/components/content/AccountSelectContent.utils"
import { ProviderLoader } from "@/components/provider/ProviderLoader"
import {
  SOLANA_PROVIDERS,
  SUI_PROVIDERS,
  WalletProviderType,
} from "@/config/providers"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useAccount } from "@/hooks/useAccount"
import { Account, useWeb3Connect, WalletMode } from "@/hooks/useWeb3Connect"
import { getDefaultAccountFilterByMode, toAccount } from "@/utils"

const getAccountOptionComponent = (account: Account) => {
  switch (true) {
    case account.provider === WalletProviderType.MetaMask:
      return AccountMetaMaskOption
    case SOLANA_PROVIDERS.includes(account.provider):
      return AccountSolanaOption
    case SUI_PROVIDERS.includes(account.provider):
      return AccountSuiOption
    default:
      return AccountOption
  }
}

export const AccountSelectContent = () => {
  const { t } = useTranslation()
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
        title={t("account.select")}
        align="center"
        customHeader={
          shouldRenderHeader && (
            <Flex direction="column" gap="xl" mt="base">
              {shouldRenderSearch && (
                <Input
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  customSize="large"
                  iconStart={Search}
                  placeholder={t("account.searchPlaceholder")}
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
      <ModalBody maxHeight="50vh">
        <Grid gap="base">
          {isProvidersConnecting ? (
            <ProviderLoader providers={providers.map(prop("type"))} />
          ) : (
            <>
              {hasNoResults && <Text>{t("account.noResults")}</Text>}
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
