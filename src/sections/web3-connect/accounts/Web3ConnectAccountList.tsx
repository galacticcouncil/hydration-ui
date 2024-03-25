import { FC, useMemo, useState } from "react"
import {
  WalletProviderType,
  useAccount,
  useWallet,
} from "sections/web3-connect/Web3Connect.utils"
import { Account } from "sections/web3-connect/store/useWeb3ConnectStore"
import { SAccountsContainer } from "./Web3ConnectAccountList.styled"
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

const getAccountComponentByType = (type: WalletProviderType | null) => {
  switch (type) {
    case WalletProviderType.ExternalWallet:
      return Web3ConnectExternalAccount
    case WalletProviderType.MetaMask:
      return Web3ConnectEvmAccount
    default:
      return Web3ConnectSubstrateAccount
  }
}

const AccountComponent: FC<
  Account & {
    isReady: boolean
    setBalanceMap: React.Dispatch<React.SetStateAction<Record<string, BN>>>
  }
> = ({ setBalanceMap, isReady, ...account }) => {
  const { type } = useWallet()
  const Component = getAccountComponentByType(type)

  const { balanceTotal, isLoading } = useWalletAssetsTotals({
    address: account.address,
  })

  useShallowCompareEffect(() => {
    if (!isLoading) {
      setBalanceMap((prev) => ({
        ...prev,
        [account.address]: balanceTotal,
      }))
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

  const [balanceMap, setBalanceMap] = useState<Record<string, BN>>({})

  const isReady = accounts.every(({ address }) => address in balanceMap)

  const [searchVal, setSearchVal] = useState("")
  const [filter, setFilter] = useState("")
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
        ])
      : accounts

    return filtered.sort((a, b) => {
      if (a.address === account?.address) return -1
      if (b.address === account?.address) return 1

      const aBalance = balanceMap[a.address]
      const bBalance = balanceMap[b.address]
      if (!aBalance || !bBalance) return 0
      return bBalance.comparedTo(aBalance)
    })
  }, [isReady, accounts, filter, account?.address, balanceMap])

  return (
    <SAccountsContainer>
      {accounts.length > 1 && (
        <Search
          value={searchVal}
          setValue={setSearchVal}
          placeholder={t("walletconnect.accountSelect.search.placeholder")}
          css={{ marginBottom: 16 }}
        />
      )}
      {filter && !accountList.length && (
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
      )}
      {accountList?.map((account) =>
        isLoaded ? (
          <AccountComponent
            key={account.address}
            {...account}
            isReady={isReady}
            setBalanceMap={setBalanceMap}
          />
        ) : (
          <Web3ConnectAccountPlaceholder />
        ),
      )}
    </SAccountsContainer>
  )
}
