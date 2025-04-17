import {
  DataTable,
  Paper,
  Separator,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import { useMemo } from "react"

import { useWalletTransactionsColumns } from "@/modules/wallet/transactions/WalletTransactionsTable.columns"
import { walletTransactionsQuery } from "@/modules/wallet/transactions/WalletTransactionsTable.data"
import { groupTransactionsByDate } from "@/modules/wallet/transactions/WalletTransactionsTable.utils"
import { WalletTransactionsTableHeader } from "@/modules/wallet/transactions/WalletTransactionsTableHeader"

type Props = {
  readonly searchPhrase: string
}

export const WalletTransactionsTable = ({ searchPhrase }: Props) => {
  const { type } = useSearch({
    from: "/_wallet/wallet/transactions",
  })

  const columns = useWalletTransactionsColumns()
  const { data = [], isLoading } = useQuery(walletTransactionsQuery(type))
  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(data),
    [data],
  )

  return (
    <TableContainer as={Paper}>
      <WalletTransactionsTableHeader />
      <Separator />
      <DataTable
        paginated
        data={groupedTransactions}
        columns={columns}
        isLoading={isLoading}
        globalFilter={searchPhrase}
      />
    </TableContainer>
  )
}
