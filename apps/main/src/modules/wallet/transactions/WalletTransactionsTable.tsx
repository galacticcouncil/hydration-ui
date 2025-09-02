import {
  DataTable,
  Paper,
  Separator,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import { SortingState } from "@tanstack/react-table"
import { useMemo, useState } from "react"

import {
  useWalletTransactionsColumns,
  WalletTransactionsTableColumnId,
} from "@/modules/wallet/transactions/WalletTransactionsTable.columns"
import {
  TransactionMock,
  walletTransactionsQuery,
} from "@/modules/wallet/transactions/WalletTransactionsTable.data"
import { groupTransactionsByDate } from "@/modules/wallet/transactions/WalletTransactionsTable.utils"
import { WalletTransactionsTableHeader } from "@/modules/wallet/transactions/WalletTransactionsTableHeader"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"
import {
  chronologicallyStr,
  Compare,
  naturally,
  numerically,
  sortBy,
} from "@/utils/sort"

type Props = {
  readonly searchPhrase: string
}

export const WalletTransactionsTable = ({ searchPhrase }: Props) => {
  const { type } = useSearch({
    from: "/wallet/transactions",
  })

  const { getAssetWithFallback } = useAssets()
  const columns = useWalletTransactionsColumns()
  const { data = [], isLoading } = useQuery(walletTransactionsQuery(type))

  const [sorting, setSorting] = useState<SortingState>([
    { id: WalletTransactionsTableColumnId.Asset, desc: true },
  ])

  const sortedTransactions = useMemo(() => {
    const { id, desc } = sorting[0] ?? {}

    const sortFn = ((): Compare<TransactionMock> | undefined => {
      switch (id) {
        default:
          return sortBy({
            select: (transaction) => transaction.timestamp,
            compare: chronologicallyStr,
            desc: true,
          })

        case WalletTransactionsTableColumnId.Asset:
          return sortBy({
            select: (transaction) => transaction.timestamp,
            compare: chronologicallyStr,
            desc,
          })

        case WalletTransactionsTableColumnId.Amount:
          return sortBy({
            select: (transaction) =>
              Number(
                scaleHuman(
                  transaction.amount,
                  getAssetWithFallback(transaction.assetId).decimals,
                ),
              ),
            compare: numerically,
            desc,
          })

        case WalletTransactionsTableColumnId.Source:
          return sortBy({
            select: (transaction) => transaction.addressFrom,
            compare: naturally,
            desc,
          })

        case WalletTransactionsTableColumnId.Destination:
          return sortBy({
            select: (transaction) => transaction.addressTo,
            compare: naturally,
            desc,
          })
      }
    })()

    return data.toSorted(sortFn)
  }, [data, sorting, getAssetWithFallback])

  const groupedTransactions = useMemo(() => {
    return !sorting[0] ||
      sorting[0]?.id === WalletTransactionsTableColumnId.Asset
      ? groupTransactionsByDate(sortedTransactions)
      : sortedTransactions
  }, [sortedTransactions, sorting])

  return (
    <TableContainer as={Paper}>
      <WalletTransactionsTableHeader data={sortedTransactions} />
      <Separator />
      <DataTable
        paginated
        data={groupedTransactions}
        columns={columns}
        isLoading={isLoading}
        globalFilter={searchPhrase}
        sorting={sorting}
        manualSorting
        enableSortingRemoval={false}
        onSortingChange={setSorting}
      />
    </TableContainer>
  )
}
