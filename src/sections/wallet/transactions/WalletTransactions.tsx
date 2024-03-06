import { Spacer } from "components/Spacer/Spacer"
import { TransactionsSearchFilter } from "./filter/TransactionsSearchFilter"
import { WalletTransactionsPlaceholder } from "./placeholder/WalletTransactionsPlaceholder"
import { TransactionsTableWrapper } from "./table/TransactionsTableWrapper"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export const WalletTransactions = () => {
  const { account } = useAccount()

  return account?.address ? (
    <>
      <TransactionsSearchFilter />
      <Spacer size={20} />
      <TransactionsTableWrapper address={account.address} />
    </>
  ) : (
    <WalletTransactionsPlaceholder />
  )
}
