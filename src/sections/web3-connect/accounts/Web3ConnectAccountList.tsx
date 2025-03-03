import { FC, Fragment, useMemo, useState } from "react"
import {
  WalletProviderType,
  useAccount,
  useAccountBalanceMap,
} from "sections/web3-connect/Web3Connect.utils"
import {
  Account,
  COMPATIBLE_WALLET_PROVIDERS,
  PROVIDERS_BY_WALLET_MODE,
  useWeb3ConnectStore,
  WalletMode,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import {
  SAccountsContainer,
  SAccountsScrollableContainer,
} from "./Web3ConnectAccountList.styled"
import { Web3ConnectEvmAccount } from "./Web3ConnectEvmAccount"
import { Web3ConnectSolanaAccount } from "./Web3ConnectSolanaAccount"
import { Web3ConnectExternalAccount } from "./Web3ConnectExternalAccount"
import { Web3ConnectSubstrateAccount } from "./Web3ConnectSubstrateAccount"
import { useDebounce, useShallowCompareEffect } from "react-use"
import { useWalletAssetsTotals } from "sections/wallet/assets/WalletAssets.utils"
import { useTranslation } from "react-i18next"
import { arraySearch } from "utils/helpers"
import NoActivities from "assets/icons/NoActivities.svg?react"
import { Text } from "components/Typography/Text/Text"
import { Search } from "components/Search/Search"
import { Alert } from "components/Alert/Alert"
import {
  EVM_PROVIDERS,
  SOLANA_PROVIDERS,
} from "sections/web3-connect/constants/providers"
import { Web3ConnectModeFilter } from "sections/web3-connect/modal/Web3ConnectModeFilter"
import { useShallow } from "hooks/useShallow"
import BigNumber from "bignumber.js"
import { Web3ConnectAccountPlaceholder } from "sections/web3-connect/accounts/Web3ConnectAccountPlaceholder"

const getAccountComponentByType = (type: WalletProviderType | null) => {
  if (!type) return Fragment

  if (type === WalletProviderType.ExternalWallet)
    return Web3ConnectExternalAccount

  if (EVM_PROVIDERS.includes(type)) return Web3ConnectEvmAccount
  if (SOLANA_PROVIDERS.includes(type)) return Web3ConnectSolanaAccount

  return Web3ConnectSubstrateAccount
}

const AccountComponent: FC<Account> = (account) => {
  const Component = getAccountComponentByType(account.provider)
  const { balanceMap, setBalanceMap } = useAccountBalanceMap()

  const isCompatibleProvider = COMPATIBLE_WALLET_PROVIDERS.includes(
    account.provider,
  )

  const { balanceTotal, isLoading } = useWalletAssetsTotals({
    address: isCompatibleProvider ? account.address : "",
  })

  useShallowCompareEffect(() => {
    if (!isCompatibleProvider) {
      setBalanceMap(account.address, "0")
      return
    }

    if (!isLoading) {
      setBalanceMap(account.address, balanceTotal)
    }
  }, [{ isLoading }])

  return (
    <Component
      {...account}
      balance={isLoading ? balanceMap[account.address] : balanceTotal}
    />
  )
}

export const Web3ConnectAccountList: FC<{
  accounts?: Account[]
  isLoading?: boolean
}> = ({ accounts = [], isLoading }) => {
  const { t } = useTranslation()
  const { account } = useAccount()

  const mode = useWeb3ConnectStore(useShallow((state) => state.mode))

  const { balanceMap } = useAccountBalanceMap()

  const [searchVal, setSearchVal] = useState("")
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<WalletMode>(WalletMode.Default)

  useDebounce(
    () => {
      setSearch(searchVal ?? "")
    },
    300,
    [searchVal],
  )

  const accountList = useMemo(() => {
    const searched = search
      ? arraySearch(accounts as Required<Account>[], search, [
          "name",
          "address",
          "displayAddress",
          "provider",
        ])
      : accounts

    let filtered = searched

    const filteredProviders =
      PROVIDERS_BY_WALLET_MODE[filter !== WalletMode.Default ? filter : mode]

    if (filteredProviders.length > 0) {
      filtered = searched.filter(({ provider }) =>
        filteredProviders.includes(provider),
      )
    }

    return filtered.sort((a, b) => {
      if (a.address === account?.address && a.provider === account?.provider) {
        return -1
      }
      if (b.address === account?.address && b.provider === account?.provider) {
        return 1
      }

      const aBalance = balanceMap[a.address]
      const bBalance = balanceMap[b.address]
      if (!aBalance || !bBalance) return 0
      return BigNumber(bBalance).comparedTo(aBalance)
    })
  }, [
    account?.address,
    account?.provider,
    accounts,
    balanceMap,
    filter,
    mode,
    search,
  ])

  const hasSolanaAccounts = accountList.some(({ provider }) =>
    SOLANA_PROVIDERS.includes(provider),
  )

  const shouldRenderFilter = accounts.length > 1 || isLoading
  const shouldRenderNoResults = accountList.length === 0 && !isLoading

  return (
    <SAccountsContainer>
      {shouldRenderFilter && (
        <div sx={{ flex: "column", mb: [4, 8], gap: [12, 16] }}>
          <Search
            value={searchVal}
            setValue={setSearchVal}
            placeholder={t("walletconnect.accountSelect.search.placeholder")}
          />
          {mode === WalletMode.Default && (
            <Web3ConnectModeFilter
              active={filter}
              onSetActive={(mode) => setFilter(mode)}
              blacklist={!hasSolanaAccounts ? [WalletMode.Solana] : []}
            />
          )}
        </div>
      )}

      {shouldRenderNoResults && (
        <>
          {search || filter !== WalletMode.Default ? (
            <div
              sx={{
                color: "basic500",
                flex: "column",
                justify: "center",
                align: "center",
                gap: 12,
                py: 18,
              }}
            >
              <NoActivities />
              <Text color="basic500">
                {t("walletconnect.accountSelect.search.noResults")}
              </Text>
            </div>
          ) : (
            <Alert variant="info">
              <Text>{t("walletconnect.accountSelect.list.noAccounts")}</Text>
            </Alert>
          )}
        </>
      )}

      <SAccountsScrollableContainer>
        {isLoading &&
          Array.from({ length: 5 }).map((_, index) => (
            <Web3ConnectAccountPlaceholder key={index} />
          ))}

        {accountList?.map((account) => (
          <AccountComponent
            key={`${account.provider}-${account.address}`}
            {...account}
          />
        ))}
      </SAccountsScrollableContainer>
    </SAccountsContainer>
  )
}
