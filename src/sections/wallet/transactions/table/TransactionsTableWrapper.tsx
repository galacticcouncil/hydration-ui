import { TransactionsTable } from "./TransactionsTable"
import { useTransactionsTableData } from "./data/TransactionsTableData.utils"
import { TransactionsTableSkeleton } from "./skeleton/TransactionsTableSkeleton"
import { useRpcProvider } from "providers/rpcProvider"

export const TransactionsTableWrapper = ({ address }: { address: string }) => {
  const { isLoaded } = useRpcProvider()

  if (!isLoaded) return <TransactionsTableSkeleton />

  return <TransactionsTableWrapperData address={address} />
}

export const TransactionsTableWrapperData = ({
  address,
}: {
  address: string
}) => {
  const transactions = useTransactionsTableData(address)

  if (transactions.isLoading && !transactions.data.length)
    return <TransactionsTableSkeleton />

  return <TransactionsTable data={transactions.data} />
}
