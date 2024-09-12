import { FC, Fragment, useMemo, useState } from "react"
import {
  WalletProviderType,
  useAccount,
} from "sections/web3-connect/Web3Connect.utils"
import {
  Account,
  useWeb3ConnectStore,
  WalletMode,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import {
  SAccountsContainer,
  SAccountsScrollableContainer,
} from "./Web3ConnectAccountList.styled"
import { Web3ConnectEvmAccount } from "./Web3ConnectEvmAccount"
import { Web3ConnectExternalAccount } from "./Web3ConnectExternalAccount"
import { Web3ConnectSubstrateAccount } from "./Web3ConnectSubstrateAccount"
import { useDebounce, useShallowCompareEffect } from "react-use"
import { useWalletAssetsTotals } from "sections/wallet/assets/WalletAssets.utils"
import { Web3ConnectAccountPlaceholder } from "sections/web3-connect/accounts/Web3ConnectAccountPlaceholder"
import BN from "bignumber.js"
import { useTranslation } from "react-i18next"
import { arraySearch } from "utils/helpers"
import NoActivities from "assets/icons/NoActivities.svg?react"
import { Text } from "components/Typography/Text/Text"
import { useRpcProvider } from "providers/rpcProvider"
import { Search } from "components/Search/Search"
import { Alert } from "components/Alert/Alert"
import { EVM_PROVIDERS } from "sections/web3-connect/constants/providers"
import { Web3ConnectModeFilter } from "sections/web3-connect/modal/Web3ConnectModeFilter"
import { useShallow } from "hooks/useShallow"
import { create } from "zustand"

const getAccountComponentByType = (type: WalletProviderType | null) => {
  if (!type) return Fragment

  if (type === WalletProviderType.ExternalWallet)
    return Web3ConnectExternalAccount

  if (EVM_PROVIDERS.includes(type)) return Web3ConnectEvmAccount

  return Web3ConnectSubstrateAccount
}

const useAccountBalanceMap = create<{
  balanceMap: Map<string, BN>
  setBalanceMap: (address: string, balance: BN) => void
}>((set) => ({
  balanceMap: new Map(),
  setBalanceMap: (address, balance) => {
    set(({ balanceMap }) => ({
      balanceMap: new Map(balanceMap).set(address, balance),
    }))
  },
}))

const AccountComponent: FC<
  Account & {
    isReady: boolean
  }
> = ({ isReady, ...account }) => {
  const Component = getAccountComponentByType(account.provider)
  const { setBalanceMap } = useAccountBalanceMap()

  const { balanceTotal, isLoading } = useWalletAssetsTotals({
    address: account.address,
  })

  useShallowCompareEffect(() => {
    if (!isLoading) {
      setBalanceMap(account.address, balanceTotal)
    }
  }, [{ isLoading }])

  return isReady ? (
    <Component {...account} balance={balanceTotal} />
  ) : (
    <Web3ConnectAccountPlaceholder {...account} />
  )
}

export const Web3ConnectAccountList: FC<{
  accounts?: Account[]
}> = ({ accounts = [] }) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { isLoaded } = useRpcProvider()

  const mode = useWeb3ConnectStore(useShallow((state) => state.mode))

  const { balanceMap } = useAccountBalanceMap()

  const isReady = accounts.every(({ address }) => balanceMap.has(address))

  const [searchVal, setSearchVal] = useState("")
  const [filter, setFilter] = useState("")

  const [selectedMode, setSelectedMode] = useState<WalletMode>(
    WalletMode.Default,
  )

  useDebounce(
    () => {
      setFilter(searchVal ?? "")
    },
    300,
    [searchVal],
  )

  const accountList = useMemo(() => {
    if (!isReady) return accounts
    const filtered = filter
      ? arraySearch(accounts as Required<Account>[], filter, [
          "name",
          "address",
          "displayAddress",
          "provider",
        ])
      : accounts

    return filtered
      .filter(({ provider }) => {
        if (selectedMode === WalletMode.Default) return true

        return selectedMode === WalletMode.EVM
          ? EVM_PROVIDERS.includes(provider)
          : !EVM_PROVIDERS.includes(provider)
      })
      .sort((a, b) => {
        if (
          a.address === account?.address &&
          a.provider === account?.provider
        ) {
          return -1
        }
        if (
          b.address === account?.address &&
          b.provider === account?.provider
        ) {
          return 1
        }

        const aBalance = balanceMap.get(a.address)
        const bBalance = balanceMap.get(b.address)
        if (!aBalance || !bBalance) return 0
        return bBalance.comparedTo(aBalance)
      })
  }, [account, accounts, balanceMap, filter, isReady, selectedMode])

  const noResults = accountList.length === 0

  return (
    <SAccountsContainer>
      {accounts.length > 1 && (
        <div sx={{ flex: "column", mb: [4, 8], gap: [12, 16] }}>
          <Search
            value={searchVal}
            setValue={setSearchVal}
            placeholder={t("walletconnect.accountSelect.search.placeholder")}
          />
          {mode === WalletMode.Default && (
            <Web3ConnectModeFilter
              active={selectedMode}
              onSetActive={(mode) => setSelectedMode(mode)}
            />
          )}
        </div>
      )}

      {noResults && (
        <>
          {filter || selectedMode !== WalletMode.Default ? (
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
        {accountList?.map((account) => (
          <Fragment key={`${account.provider}-${account.address}`}>
            {isLoaded ? (
              <AccountComponent {...account} isReady={isReady} />
            ) : (
              <Web3ConnectAccountPlaceholder />
            )}
          </Fragment>
        ))}
      </SAccountsScrollableContainer>
    </SAccountsContainer>
  )
}
