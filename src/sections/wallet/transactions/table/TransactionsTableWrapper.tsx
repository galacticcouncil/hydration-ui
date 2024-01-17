import { TransactionsTable } from "./TransactionsTable"
import { useTransactionsTableData } from "./data/TransactionsTableData.utils"
import { TransactionsTableSkeleton } from "./skeleton/TransactionsTableSkeleton"
import { useRpcProvider } from "providers/rpcProvider"
import { Button } from "components/Button/Button"

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

  if (isLoading && !data.length) return <TransactionsTableSkeleton />

  return (
    <>
      <TransactionsTable data={data} filteredData={filteredData} />
      {hasNextPage && (
        <div sx={{ textAlign: "center", mt: 24 }}>
          <Button onClick={setNextPage}>More Transactions</Button>
        </div>
      )}
    </>
  )
}
