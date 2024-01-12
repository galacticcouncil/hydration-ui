import { WalletTransactionsPlaceholder } from "sections/wallet/transactions/placeholder/WalletTransactionsPlaceholder"
import { TransactionsTableWrapper } from "sections/wallet/transactions/table/TransactionsTableWrapper"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export const WalletTransactions = () => {
  const { account } = useAccount()

  return account?.address ? (
    <TransactionsTableWrapper address={account.address} />
  ) : (
    <WalletTransactionsPlaceholder />
  )
}
