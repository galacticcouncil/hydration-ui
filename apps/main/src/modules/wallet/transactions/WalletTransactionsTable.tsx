import {
  DataTable,
  Paper,
  Separator,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import { useMemo } from "react"

import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { useDataTableUrlSorting } from "@/hooks/useDataTableUrlSorting"
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

  const paginationProps = useDataTableUrlPagination(
    "/wallet/transactions",
    "page",
  )

  const sortingProps = useDataTableUrlSorting("/wallet/transactions", "sort", {
    onChange: () => paginationProps.onPageClick(1),
  })

  const sortedTransactions = useMemo(() => {
    const { id, desc } = sortingProps.sorting[0] ?? {}

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
  }, [data, sortingProps.sorting, getAssetWithFallback])

  const groupedTransactions = useMemo(() => {
    return !sortingProps.sorting[0] ||
      sortingProps.sorting[0]?.id === WalletTransactionsTableColumnId.Asset
      ? groupTransactionsByDate(sortedTransactions)
      : sortedTransactions
  }, [sortedTransactions, sortingProps.sorting])

  return (
    <TableContainer as={Paper}>
      <WalletTransactionsTableHeader data={sortedTransactions} />
      <Separator />
      <DataTable
        paginated
        {...paginationProps}
        {...sortingProps}
        data={groupedTransactions}
        columns={columns}
        isLoading={isLoading}
        globalFilter={searchPhrase}
        manualSorting
        enableSortingRemoval={false}
      />
    </TableContainer>
  )
}
