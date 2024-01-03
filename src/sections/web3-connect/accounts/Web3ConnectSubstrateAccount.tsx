import { ComponentPropsWithoutRef } from "react"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { Web3ConnectAccount } from "./Web3ConnectAccount"

export const Web3ConnectSubstrateAccount: React.FC<
  ComponentPropsWithoutRef<typeof Web3ConnectAccount>
> = ({ balance, ...account }) => {
  const { account: currentAccount, setAccount, toggle } = useWeb3ConnectStore()
  const isActive = currentAccount?.address === account.address

  return (
    <Web3ConnectAccount
      {...account}
      balance={balance}
      isActive={isActive}
      onClick={(account) => {
        setAccount(account)
        toggle()
      }}
    />
  )
}
