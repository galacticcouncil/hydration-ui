import {
  DataTable,
  Flex,
  Paper,
  Separator,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { OnChangeFn, PaginationState } from "@tanstack/react-table"
import { FC, useMemo } from "react"

import { BorrowHistoryFilter } from "@/modules/borrow/history/BorrowHistoryFilter"
import { useBorrowHistoryColumns } from "@/modules/borrow/history/BorrowHistoryTable.columns"
import { useMoneyMarketEvents } from "@/modules/borrow/history/BorrowHistoryTable.query"
import {
  getOnUpdatePendingStyles,
  mapMoneyMarketEvents,
} from "@/modules/borrow/history/BorrowHistoryTable.utils"

type Props = {
  readonly searchPhrase: string
  readonly pagination: PaginationState
  readonly onPaginationChange: OnChangeFn<PaginationState>
}

export const BorrowHistoryTable: FC<Props> = ({
  searchPhrase,
  pagination,
  onPaginationChange,
}) => {
  const { type } = useSearch({
    from: "/borrow/history",
  })

  const { data, isLoading, isFetching } = useMoneyMarketEvents(
    type,
    searchPhrase,
    pagination,
  )

  const eventsWithDays = useMemo(() => mapMoneyMarketEvents(data), [data])
  const columns = useBorrowHistoryColumns()

  const isUpdatePending = !isLoading && isFetching

  return (
    <TableContainer as={Paper}>
      <Flex p="m" justify="space-between" align="center">
        <BorrowHistoryFilter
          onChange={() =>
            onPaginationChange((prev) => ({ ...prev, pageIndex: 0 }))
          }
        />
      </Flex>
      <Separator />
      <DataTable
        sx={getOnUpdatePendingStyles(isUpdatePending)}
        paginated
        onPageClick={(pageIndex) =>
          onPaginationChange((prev) => ({ ...prev, pageIndex }))
        }
        rowCount={data?.moneyMarketEvents?.totalCount ?? 0}
        data={eventsWithDays}
        columns={columns}
        isLoading={isLoading}
      />
    </TableContainer>
  )
}
