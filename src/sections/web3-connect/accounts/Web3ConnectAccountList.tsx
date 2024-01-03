import { FC, useMemo, useState } from "react"
import {
  WalletProviderType,
  useWallet,
} from "sections/web3-connect/Web3Connect.utils"
import { Account } from "sections/web3-connect/store/useWeb3ConnectStore"
import { MetaMask } from "sections/web3-connect/wallets/MetaMask"
import { SAccountsContainer } from "./Web3ConnectAccountList.styled"
import { Web3ConnectEvmAccount } from "./Web3ConnectEvmAccount"
import { Web3ConnectExternalAccount } from "./Web3ConnectExternalAccount"
import { Web3ConnectSubstrateAccount } from "./Web3ConnectSubstrateAccount"
import { useShallowCompareEffect } from "react-use"
import { useWalletAssetsTotals } from "sections/wallet/assets/WalletAssets.utils"
import { Web3ConnectAccountPlaceholder } from "sections/web3-connect/accounts/Web3ConnectAccountPlaceholder"
import BN from "bignumber.js"

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
    type: WalletProviderType | null
    isReady: boolean
    setBalanceMap: React.Dispatch<React.SetStateAction<Record<string, BN>>>
  }
> = ({ setBalanceMap, type, isReady, ...account }) => {
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
    <Web3ConnectAccountPlaceholder />
  )
}

export const Web3ConnectAccountList: FC<{
  accounts?: Account[]
}> = ({ accounts = [] }) => {
  const { type, wallet } = useWallet()

  // show only main account for metamask
  const accountList =
    wallet instanceof MetaMask ? accounts.slice(0, 1) : accounts

  const [balanceMap, setBalanceMap] = useState<Record<string, BN>>({})
  const isReady = Object.keys(balanceMap).length === accountList.length

  const sortedAccounts = useMemo(() => {
    if (!isReady) return accountList
    return accountList.sort((a, b) => {
      const aBalance = balanceMap[a.address]
      const bBalance = balanceMap[b.address]
      if (!aBalance || !bBalance) return 0
      return bBalance.comparedTo(aBalance)
    })
  }, [balanceMap, accountList, isReady])

  return (
    <SAccountsContainer>
      {sortedAccounts?.map((account) => (
        <AccountComponent
          key={account.address}
          {...account}
          type={type}
          isReady={isReady}
          setBalanceMap={setBalanceMap}
        />
      ))}
    </SAccountsContainer>
  )
}
