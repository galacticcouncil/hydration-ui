import {
  DataTable,
  Flex,
  Paper,
  Separator,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC, useMemo } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { BorrowHistoryFilter } from "@/modules/borrow/history/BorrowHistoryFilter"
import { useBorrowHistoryColumns } from "@/modules/borrow/history/BorrowHistoryTable.columns"
import { useMoneyMarketEvents } from "@/modules/borrow/history/BorrowHistoryTable.query"
import {
  getOnUpdatePendingStyles,
  mapMoneyMarketEvents,
} from "@/modules/borrow/history/BorrowHistoryTable.utils"

type Props = {
  readonly searchPhrase: string
  readonly paginationProps: PaginationProps
}

export const BorrowHistoryTable: FC<Props> = ({
  searchPhrase,
  paginationProps,
}) => {
  const { type } = useSearch({
    from: "/borrow/history",
  })

  const { data, isLoading, isFetching } = useMoneyMarketEvents(
    type,
    searchPhrase,
    paginationProps.pagination,
  )

  const eventsWithDays = useMemo(() => mapMoneyMarketEvents(data), [data])
  const columns = useBorrowHistoryColumns()

  const isUpdatePending = !isLoading && isFetching

  return (
    <TableContainer as={Paper}>
      <Flex p="m" justify="space-between" align="center">
        <BorrowHistoryFilter onChange={() => paginationProps.onPageClick(1)} />
      </Flex>
      <Separator />
      <DataTable
        sx={getOnUpdatePendingStyles(isUpdatePending)}
        paginated
        {...paginationProps}
        rowCount={data?.moneyMarketEvents?.totalCount ?? 0}
        data={eventsWithDays}
        columns={columns}
        isLoading={isLoading}
      />
    </TableContainer>
  )
}
