import { useTablePagination } from "components/Table/TablePagination"
import { useState } from "react"
import { LendingHistoryPlaceholder } from "sections/lending/subsections/history/LendingHistoryPlaceholder"
import { LendingHistorySearch } from "sections/lending/subsections/history/LendingHistorySearch"
import { LendingHistoryTable } from "sections/lending/subsections/history/LendingHistoryTable"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export const LendingHistoryPage = () => {
  const { account } = useAccount()

  const [searchPhrase, setSearchPhrase] = useState("")
  const [pagination, setPagination] = useTablePagination()

  if (!account?.address) {
    return <LendingHistoryPlaceholder />
  }

  return (
    <div sx={{ flex: "column", gap: 20 }}>
      <LendingHistorySearch
        onChange={(searchPhrase) => {
          setSearchPhrase(searchPhrase)
          setPagination((prev) => ({ ...prev, pageIndex: 0 }))
        }}
      />
      <LendingHistoryTable
        searchPhrase={searchPhrase}
        pagination={pagination}
        onPaginationChange={setPagination}
      />
    </div>
  )
}
