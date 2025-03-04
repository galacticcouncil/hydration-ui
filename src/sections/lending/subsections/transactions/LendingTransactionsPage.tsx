import { useTablePagination } from "components/Table/TablePagination"
import { useState } from "react"
import { LendingTransactionsSearch } from "sections/lending/subsections/transactions/LendingTransactionsSearch"
import { LendingTransactionsTable } from "sections/lending/subsections/transactions/LendingTransactionsTable"

export const LendingTransactionsPage = () => {
  const [searchPhrase, setSearchPhrase] = useState("")
  const [pagination, setPagination] = useTablePagination()

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
