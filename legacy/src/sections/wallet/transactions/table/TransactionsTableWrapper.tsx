import { useRpcProvider } from "providers/rpcProvider"
import { TransactionsTable } from "./TransactionsTable"
import { useTransactionsTableData } from "./data/TransactionsTableData.utils"
import { TransactionsTableSkeleton } from "./skeleton/TransactionsTableSkeleton"

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
  const { isLoading, data, filteredData, setNextPage, hasNextPage } =
    useTransactionsTableData(address)

  if (isLoading) return <TransactionsTableSkeleton />

  return (
    <TransactionsTable
      data={data}
      filteredData={filteredData}
      setNextPage={setNextPage}
      hasNextPage={hasNextPage}
    />
  )
}
