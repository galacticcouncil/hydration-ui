import {
  Flex,
  Stack,
  TableProps,
  Text,
  useDataTable,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { ColumnDef, flexRender, RowData } from "@tanstack/react-table"
import { forwardRef } from "react"

export type StackedTableProps<TData extends RowData> = TableProps & {
  isLoading?: boolean
  skeletonRowCount?: number
  data: TData[]
  columns:
    | {
        [K in keyof Required<TData>]: ColumnDef<TData, TData[K]>
      }[keyof TData][]
    | ColumnDef<TData>[]
}

const StackedTable = forwardRef(
  <TData,>({
    data,
    columns,
    isLoading,
    skeletonRowCount = 10,
  }: StackedTableProps<TData>) => {
    const table = useDataTable({
      data,
      columns,
      isLoading,
      skeletonRowCount,
    })

    const headers = table.getHeaderGroups()[0]?.headers ?? []

    return (
      <Stack separated>
        {table.getRowModel().rows.map((row) => (
          <Stack separated key={row.id}>
            {row.getVisibleCells().map((cell) => {
              const header = headers.find((h) => h.column.id === cell.column.id)

              const shouldRenderHeader = !!header?.column.columnDef.header

              return (
                <Flex
                  key={cell.id}
                  p={getTokenPx("scales.paddings.m")}
                  align="center"
                  justify="space-between"
                >
                  {shouldRenderHeader && (
                    <Text fs="p4" color={getToken("text.low")}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                    </Text>
                  )}
                  <Flex
                    flex={1}
                    justify={shouldRenderHeader ? "flex-end" : "flex-start"}
                    sx={{ textAlign: shouldRenderHeader ? "right" : "left" }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Flex>
                </Flex>
              )
            })}
          </Stack>
        ))}
      </Stack>
    )
  },
)

StackedTable.displayName = "StackedTable"

type StackedTableComponent = {
  <TData>(props: StackedTableProps<TData>): JSX.Element
}

const StackedTableWithType = StackedTable as unknown as StackedTableComponent

export { StackedTableWithType as StackedTable }
