import { useTablePagination } from "components/Table/TablePagination"
import { useState } from "react"
import { LendingTransactionsPlaceholder } from "sections/lending/subsections/transactions/LendingTransactionsPlaceholder"
import { LendingTransactionsSearch } from "sections/lending/subsections/transactions/LendingTransactionsSearch"
import { LendingTransactionsTable } from "sections/lending/subsections/transactions/LendingTransactionsTable"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export const LendingTransactionsPage = () => {
  const { account } = useAccount()

  const [searchPhrase, setSearchPhrase] = useState("")
  const [pagination, setPagination] = useTablePagination()

  if (!account?.address) {
    return <LendingTransactionsPlaceholder />
  }

  return (
    <div sx={{ flex: "column", gap: 20 }}>
      <LendingTransactionsSearch
        onChange={(searchPhrase) => {
          setSearchPhrase(searchPhrase)
          setPagination((prev) => ({ ...prev, pageIndex: 0 }))
        }}
      />
      <LendingTransactionsTable
        searchPhrase={searchPhrase}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </div>
  )
}
