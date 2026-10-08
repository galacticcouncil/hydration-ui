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

import { AccountFilter } from "@/components/account/AccountFilter"
import { AccountMetaMaskOption } from "@/components/account/AccountMetaMaskOption"
import { AccountMultisigOption } from "@/components/account/AccountMultisigOption"
import { AccountOption } from "@/components/account/AccountOption"
import { AccountSolanaOption } from "@/components/account/AccountSolanaOption"
import { AccountSuiOption } from "@/components/account/AccountSuiOption"
import {
  getFilteredAccounts,
  useAccountsWithBalance,
} from "@/components/content/AccountSelectContent.utils"
import { ProviderLoader } from "@/components/provider/ProviderLoader"
import { ProviderUnavailable } from "@/components/provider/ProviderUnavailable"
import { Web3ConnectModalPage } from "@/config/modal"
import {
  SOLANA_PROVIDERS,
  SUI_PROVIDERS,
  WalletProviderType,
} from "@/config/providers"
import { WalletAccountFilterOption } from "@/config/wallet"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useAccount } from "@/hooks/useAccount"
import { useActiveMultisigConfig } from "@/hooks/useMultisigConfigs"
import { MultisigConfig, useMultisigStore } from "@/hooks/useMultisigStore"
import {
  Account,
  useWeb3Connect,
  WalletMode,
  WalletProviderStatus,
  WalletRestoreState,
} from "@/hooks/useWeb3Connect"
import { useWeb3Enable } from "@/hooks/useWeb3Enable"
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
  const { onAccountSelect, isControlled, mode, setPage } =
    useWeb3ConnectContext()
  const { accounts, restoreStates, toggle, getProviders } = useWeb3Connect(
    useShallow(
      pick([
        "accounts",
        "providers",
        "restoreStates",
        "toggle",
        "getProviders",
      ]),
    ),
  )
  const { enable: retryRestore } = useWeb3Enable({ restore: true })
  const [retriedProviders, setRetriedProviders] = useState<
    WalletProviderType[]
  >([])
  const { setActive } = useMultisigStore()
  const activeMultisig = useActiveMultisigConfig()

  const isDefaultMode = mode === WalletMode.Default

  const [filter, setFilter] = useState<WalletAccountFilterOption>(
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
  const providerTypes = providers.map(prop("type"))
  const pendingProviders = providers
    .filter(
      ({ type, status }) =>
        status === WalletProviderStatus.Pending ||
        restoreStates[type] === WalletRestoreState.Restoring,
    )
    .map(prop("type"))
  const unavailableProviders = providerTypes.filter(
    (type) =>
      !pendingProviders.includes(type) &&
      restoreStates[type] === WalletRestoreState.Unavailable,
  )
  const hasProviderAccounts = accounts.some(({ provider }) =>
    providerTypes.includes(provider),
  )
  const isProvidersConnecting =
    pendingProviders.length > 0 && !hasProviderAccounts

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

  const hasNoResults = accountList.length === 0 && !activeMultisig

  const handleAccountSelect = useCallback(
    (account: Account) => {
      onAccountSelect(account)
      if (!isControlled) {
        toggle()
      }
    },
    [isControlled, onAccountSelect, toggle],
  )

  const handleMultisigSelect = useCallback(
    (config: MultisigConfig) => {
      setActive(config.id, null)
      setPage(Web3ConnectModalPage.MultisigSignerSelect)
    },
    [setActive, setPage],
  )

  const handleRetry = useCallback(
    (provider: WalletProviderType) => {
      setRetriedProviders((prev) => [...prev, provider])
      retryRestore(provider).catch(() => {})
    },
    [retryRestore],
  )

  const { accountsWithBalances, areBalancesLoading } =
    useAccountsWithBalance(accountList)

  const shouldRenderSearch = accountsWithBalances.length > 1
  const shouldRenderHeader =
    !isProvidersConnecting && (isDefaultMode || shouldRenderSearch)

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
                  whitelist={[WalletMode.Substrate, WalletMode.EVM]}
                  onSetActive={(mode) => setFilter(mode)}
                />
              )}
            </Flex>
          )
        }
      />
      <ModalBody maxHeight="50vh">
        <Grid gap="base">
          {unavailableProviders.map((provider) => (
            <ProviderUnavailable
              key={provider}
              provider={provider}
              hasRetried={retriedProviders.includes(provider)}
              onRetry={handleRetry}
            />
          ))}
          {isProvidersConnecting ? (
            <ProviderLoader providers={pendingProviders} />
          ) : (
            <>
              {pendingProviders.map((provider) => (
                <ProviderLoader key={provider} providers={[provider]} compact />
              ))}
              {hasNoResults && <Text>{t("account.noResults")}</Text>}
              {isDefaultMode && activeMultisig && (
                <AccountMultisigOption
                  key={activeMultisig.id}
                  isActive={!!currentAccount?.isMultisig}
                  onSelect={handleMultisigSelect}
                  config={activeMultisig}
                />
              )}
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
