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
  const { account } = useAccount()
  const [balanceMap, setBalanceMap] = useState<Record<string, BN>>({})
  const isReady = Object.keys(balanceMap).length === accounts.length

  const accountList = useMemo(() => {
    if (!isReady) return accounts
    return accounts.sort((a, b) => {
      if (a.address === account?.address) return -1
      if (b.address === account?.address) return 1

      const aBalance = balanceMap[a.address]
      const bBalance = balanceMap[b.address]
      if (!aBalance || !bBalance) return 0
      return bBalance.comparedTo(aBalance)
    })
  }, [isReady, accounts, account?.address, balanceMap])

  return (
    <SAccountsContainer>
      {accountList?.map((account) => (
        <AccountComponent
          key={account.address}
          {...account}
          isReady={isReady}
          setBalanceMap={setBalanceMap}
        />
      ))}
    </SAccountsContainer>
  )
}
