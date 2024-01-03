import { useNavigate } from "@tanstack/react-location"
import { Web3ConnectAccount } from "./Web3ConnectAccount"
import {
  Account,
  useWeb3ConnectStore,
} from "sections/web3-connect/store/useWeb3ConnectStore"

export type Props = Account

export const Web3ConnectSubstrateAccount: React.FC<Props> = ({
  ...account
}) => {
  const { account: currentAccount, setAccount, toggle } = useWeb3ConnectStore()
  const navigate = useNavigate()
  const isActive = currentAccount?.address === account.address
  return (
    <Web3ConnectAccount
      {...account}
      isActive={isActive}
      onClick={(account) => {
        setAccount(account)
        toggle()
        navigate({ search: { account: undefined } })
      }}
    />
  )
}
