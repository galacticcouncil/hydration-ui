import type { ReserveSummary } from "@galacticcouncil/money-market/types"
import { ChevronDown } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Box,
  Button,
  DataTable,
  Flex,
  Paper,
  Separator,
  Skeleton,
  Stack,
  Summary,
  TableContainer,
  TableSize,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  Cell,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { FC, ReactNode, useState } from "react"

import { useNavigateToReserve } from "@/modules/money-market/hooks"
import { TablePaper } from "@/modules/money-market/table/TablePaper"

/**
 * The rows as cards, one per reserve, for mobile: the amount (or, without
 * one, the first column) and the actions head the card, every other titled
 * column is a row of its own.
 */
const ReserveCards = <T extends { reserve: ReserveSummary }>({
  data,
  columns,
}: {
  data: T[]
  columns: ColumnDef<T>[]
}) => {
  const navigateToReserve = useNavigateToReserve()
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return table.getRowModel().rows.map((row) => {
    const [first, ...cells] = row.getVisibleCells()
    const actions = cells.find((cell) => cell.column.id === "actions")
    // an amount column heads the card in place of the asset, as it shows both
    const title = cells.find((cell) => cell.column.id === "amount") ?? first
    const render = (cell: Cell<T, unknown>) =>
      flexRender(cell.column.columnDef.cell, cell.getContext())

    return (
      <Paper
        key={row.original.reserve.underlyingAsset}
        p="l"
        shadow={false}
        bg="dim"
        borderRadius="m"
        sx={{ cursor: "pointer" }}
        onClick={() => navigateToReserve(row.original.reserve.underlyingAsset)}
      >
        <Flex justify="space-between" align="center" gap="base">
          {title && render(title)}
          {actions && render(actions)}
        </Flex>
        <Separator mt="base" />
        <Summary
          mt="s"
          mb="-l"
          rows={cells.flatMap((cell) => {
            const { header } = cell.column.columnDef
            return typeof header === "string" && cell !== title
              ? [{ label: header, content: render(cell) }]
              : []
          })}
        />
      </Paper>
    )
  })
}

export type TableState = { isLoading: boolean; error: Error | null }

/** A failed read, with the chain's own reason underneath the wrapper's. */
export const ReadError: FC<{ error: Error }> = ({ error }) => (
  <Alert
    variant="error"
    title={`${error.name}: ${error.message}`}
    description={error.cause instanceof Error ? error.cause.message : undefined}
  />
)

/** Every row is a reserve, and clicking one opens that reserve's detail. */
export const ReserveDataTable = <T extends { reserve: ReserveSummary }>({
  data,
  columns,
  empty,
  isLoading = false,
  size,
  limit,
  flat,
}: {
  data: T[]
  columns: ColumnDef<T>[]
  empty: string
  isLoading?: boolean
  size?: TableSize
  /** Rows shown until "Show X more" is clicked; all rows when omitted. */
  limit?: number
  /** Square corners, for a table stacked with others inside a panel. */
  flat?: boolean
}) => {
  const navigateToReserve = useNavigateToReserve()
  const [expanded, setExpanded] = useState(false)
  const { isMobile } = useBreakpoints()
  const hidden = !expanded && limit ? Math.max(data.length - limit, 0) : 0
  const rows = hidden ? data.slice(0, limit) : data

  return (
    <TableContainer borderRadius={flat ? undefined : "xl"}>
      {isMobile ? (
        <Stack gap="m" p="l">
          {isLoading ? (
            Array.from({ length: 4 }, (_, i) => (
              <Skeleton key={i} height="6rem" />
            ))
          ) : (
            <ReserveCards data={rows} columns={columns} />
          )}
        </Stack>
      ) : (
        <DataTable
          fixedLayout
          size={size}
          skeletonRowCount={4}
          isLoading={isLoading}
          data={rows}
          columns={columns}
          onRowClick={(row) => navigateToReserve(row.reserve.underlyingAsset)}
          emptyState={
            <Text fw={500} color={getToken("text.low")}>
              {empty}
            </Text>
          }
        />
      )}
      {hidden > 0 && (
        <>
          <Separator />
          <Box p="base">
            <Button
              iconEnd={ChevronDown}
              variant="transparent"
              size="small"
              width="100%"
              onClick={() => setExpanded(true)}
            >
              Show {hidden} more
            </Button>
          </Box>
        </>
      )}
    </TableContainer>
  )
}

/**
 * A dashboard panel: title row with its actions or stats, the table, then an
 * optional footer. `pinned` is a second table stacked above the main one.
 */
export const ReserveTable = <T extends { reserve: ReserveSummary }>({
  title,
  actions,
  footer,
  error,
  pinned,
  ...table
}: TableState & {
  title: string
  actions?: ReactNode
  footer?: ReactNode
  data: T[]
  columns: ColumnDef<T>[]
  pinned?: { data: T[]; columns: ColumnDef<T>[] }
  empty: string
}) => {
  const hasPinned = !!pinned?.data.length
  const hasRows = table.isLoading || table.data.length > 0

  return (
    <TablePaper>
      <Flex
        justify="space-between"
        align="center"
        gap="base"
        p="xl"
        sx={{ flexWrap: "wrap" }}
      >
        <Text as="h2" fs="p2" fw={500} font="primary" sx={{ flexGrow: 999 }}>
          {title}
        </Text>
        {actions}
      </Flex>
      <Separator />
      {error ? (
        <Box p="xl">
          <ReadError error={error} />
        </Box>
      ) : !hasRows && !hasPinned ? (
        <Text p="xl" fw={500} color={getToken("text.low")}>
          {table.empty}
        </Text>
      ) : (
        <>
          {hasPinned && <ReserveDataTable {...table} {...pinned} flat />}
          {hasPinned && hasRows && <Separator />}
          {hasRows && <ReserveDataTable {...table} flat={!!pinned} />}
        </>
      )}
      {!error && footer}
    </TablePaper>
  )
}
