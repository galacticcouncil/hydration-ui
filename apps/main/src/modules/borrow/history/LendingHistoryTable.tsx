import {
  DataTable,
  Flex,
  Paper,
  Separator,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useSearch } from "@tanstack/react-router"
import { OnChangeFn, PaginationState } from "@tanstack/react-table"
import { FC, useMemo } from "react"

import { LendingHistoryFilter } from "@/modules/borrow/history/LendingHistoryFilter"
import { useLendingHistoryColumns } from "@/modules/borrow/history/LendingHistoryTable.columns"
import { useMoneyMarketEvents } from "@/modules/borrow/history/LendingHistoryTable.query"
import { mapMoneyMarketEvents } from "@/modules/borrow/history/LendingHistoryTable.utils"

type Props = {
  readonly searchPhrase: string
  readonly pagination: PaginationState
  readonly onPaginationChange: OnChangeFn<PaginationState>
}

export const LendingHistoryTable: FC<Props> = ({
  searchPhrase,
  pagination,
  onPaginationChange,
}) => {
  const { type } = useSearch({
    from: "/borrow/history",
  })

  const { data, isLoading } = useMoneyMarketEvents(
    type,
    searchPhrase,
    pagination,
  )

  const eventsWithDays = useMemo(() => mapMoneyMarketEvents(data), [data])
  const columns = useLendingHistoryColumns()

  return (
    <TableContainer as={Paper}>
      <Flex
        p={getTokenPx("scales.paddings.m")}
        justify="space-between"
        align="center"
      >
        <LendingHistoryFilter
          onChange={() =>
            onPaginationChange((prev) => ({ ...prev, pageIndex: 0 }))
          }
        />
      </Flex>
      <Separator />
      {eventsWithDays.length || isLoading ? (
        <DataTable
          paginated
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          rowCount={data?.moneyMarketEvents?.totalCount ?? 0}
          data={eventsWithDays}
          columns={columns}
          isLoading={isLoading}
        />
      ) : (
        <>empty</>
      )}
    </TableContainer>
  )
}
