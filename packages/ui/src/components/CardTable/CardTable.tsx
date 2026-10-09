import { ColumnDef, flexRender, RowData } from "@tanstack/react-table"

import { Box } from "@/components/Box"
import { useDataTable } from "@/components/DataTable"
import { Flex } from "@/components/Flex"
import { Paper } from "@/components/Paper"
import { Separator } from "@/components/Separator"
import { Skeleton } from "@/components/Skeleton"
import { Stack } from "@/components/Stack"
import { ValueStats, ValueStatsLabel } from "@/components/ValueStats"
import { useBreakpoints } from "@/theme"

export type CardTableProps<TData extends RowData> = {
  data: TData[]
  columns:
    | {
        [K in keyof Required<TData>]: ColumnDef<TData, TData[K]>
      }[keyof TData][]
    | ColumnDef<TData>[]
  isLoading?: boolean
  skeletonRowCount?: number
  statsColumns?: number
  className?: string
}

/**
 * Renders table rows as cards: first visible column in the header on the
 * left, last column in the header on the right when it has no `header`
 * (actions), the rest as stats. On mobile, actions move to a full-width row
 * below the stats.
 */
const CardTable = <TData,>({
  data,
  columns,
  isLoading,
  skeletonRowCount = 3,
  statsColumns,
  className,
}: CardTableProps<TData>) => {
  const { isMobile } = useBreakpoints()
  const table = useDataTable({
    data,
    columns,
    isLoading,
    skeletonRowCount,
  })

  // Resolved column defs always carry tanstack's default `header`, so check
  // the def as passed in.
  const actionColumnId = columns.at(-1)?.header
    ? undefined
    : table.getAllLeafColumns().at(-1)?.id

  const headers = table.getFlatHeaders()

  return (
    <Stack gap="m" className={className}>
      {table.getRowModel().rows.map((row) => {
        const cells = row.getVisibleCells()
        const actionCell = cells.find((c) => c.column.id === actionColumnId)
        const [titleCell, ...statCells] = cells.filter((c) => c !== actionCell)

        const action =
          actionCell &&
          flexRender(actionCell.column.columnDef.cell, actionCell.getContext())

        return (
          <Paper key={row.id} p="l" shadow={false} bg="dim" borderRadius="l">
            <Flex align="center" justify="space-between" gap="m" wrap>
              {titleCell &&
                flexRender(
                  titleCell.column.columnDef.cell,
                  titleCell.getContext(),
                )}
              {!isMobile && action}
            </Flex>
            {statCells.length > 0 && (
              <>
                <Separator my="m" mx="-l" />
                <Flex
                  justify="space-between"
                  gap="l"
                  align="start"
                  wrap
                  sx={
                    statsColumns
                      ? {
                          display: "grid",
                          gridTemplateColumns: `repeat(${statsColumns}, minmax(0, 1fr))`,
                        }
                      : undefined
                  }
                >
                  {statCells.map((cell, index) => {
                    const header = headers.find(
                      (h) => h.column.id === cell.column.id,
                    )
                    const isLast =
                      statCells.length > 1 && index === statCells.length - 1

                    return (
                      <ValueStats
                        key={cell.id}
                        wrap
                        size="small"
                        font="secondary"
                        align={!statsColumns && isLast ? "right" : "left"}
                        customLabel={
                          header && (
                            <ValueStatsLabel
                              style={
                                statsColumns
                                  ? { whiteSpace: "normal" }
                                  : undefined
                              }
                            >
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                            </ValueStatsLabel>
                          )
                        }
                        customValue={
                          // The generic skeleton cell is `min(80px, 100%)`,
                          // which collapses in an auto-width stat.
                          isLoading ? (
                            <Skeleton width={80} height="1em" />
                          ) : (
                            flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )
                          )
                        }
                      />
                    )
                  })}
                </Flex>
              </>
            )}
            {isMobile && action && (
              <Box
                mt="l"
                sx={{ "& > *": { width: "100%" }, "& button": { flex: 1 } }}
              >
                {action}
              </Box>
            )}
          </Paper>
        )
      })}
    </Stack>
  )
}

type CardTableComponent = {
  <TData>(props: CardTableProps<TData>): React.JSX.Element
}

const CardTableWithType = CardTable as unknown as CardTableComponent

export { CardTableWithType as CardTable }
