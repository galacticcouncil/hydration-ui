import {
  ColumnDef,
  flexRender,
  Row,
  RowData,
  SortingState,
  Table as TableDef,
} from "@tanstack/react-table"
import { Fragment, useCallback, useMemo } from "react"

import { Button } from "@/components/Button"
import { Flex } from "@/components/Flex"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableProps,
  TableRow,
} from "@/components/Table"
import { Text } from "@/components/Text"
import { getToken } from "@/utils"

import {
  getPaginationRange,
  useDataTable,
  UseDataTableOwnOptions,
} from "./DataTable.utils"

export type DataTableProps<TData extends RowData> = TableProps &
  UseDataTableOwnOptions & {
    pageSize?: number
    globalFilter?: string
    initialSorting?: SortingState
    data: TData[]
    noResultsMessage?: string
    columns: {
      [K in keyof Required<TData>]: ColumnDef<TData, TData[K]>
    }[keyof TData][]
    className?: string
    renderSubComponent?: (props: { row: Row<TData> }) => React.ReactElement
    onRowClick?: (props: { row: Row<TData> }) => void
  }

export function DataTable<TData>({
  data,
  columns,
  className,
  size = "medium",
  fixedLayout = false,
  paginated = false,
  expandable = false,
  pageSize = 20,
  borderless,
  hoverable,
  isLoading,
  skeletonRowCount,
  globalFilter,
  initialSorting,
  noResultsMessage,
  renderSubComponent,
  onRowClick,
}: DataTableProps<TData>) {
  const tableProps = {
    fixedLayout,
    size,
    borderless,
    hoverable,
  }

  const table = useDataTable({
    data,
    columns,
    isLoading,
    paginated,
    expandable,
    skeletonRowCount,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize,
      },
      sorting: initialSorting,
    },
    state: {
      globalFilter,
    },
  })

  return (
    <>
      <Table {...tableProps} className={className}>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const { meta } = header.getContext().column.columnDef
                return (
                  <TableHead
                    key={header.id}
                    canSort={header.column.getCanSort()}
                    sortDirection={header.column.getIsSorted()}
                    onSort={header.column.getToggleSortingHandler()}
                    className={meta?.className}
                    sx={meta?.sx}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <Fragment key={row.id}>
                <TableRow
                  data-expanded={expandable ? row.getIsExpanded() : undefined}
                  data-selected={row.getIsSelected()}
                  onClick={onRowClick ? () => onRowClick({ row }) : undefined}
                  sx={onRowClick && { cursor: "pointer" }}
                >
                  {row.getVisibleCells().map((cell) => {
                    const { meta } = cell.getContext().cell.column.columnDef
                    return (
                      <TableCell
                        key={cell.id}
                        className={meta?.className}
                        sx={meta?.sx}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
                {expandable && renderSubComponent && row.getIsExpanded() && (
                  <TableRow>
                    <TableCell colSpan={table.getVisibleLeafColumns().length}>
                      {renderSubComponent({ row })}
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length}>
                {noResultsMessage ?? "No results."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {!isLoading && paginated && table.getPageCount() > 1 && (
        <DataTablePagination table={table} />
      )}
    </>
  )
}

type DataTablePaginationProps<T> = {
  table: TableDef<T>
}

export const DataTablePagination = <T,>({
  table,
}: DataTablePaginationProps<T>) => {
  const totalPages = table.getPageCount()
  const currentPage = table.getState().pagination.pageIndex + 1

  const pagination = useMemo(
    () => getPaginationRange(totalPages, currentPage),
    [currentPage, totalPages],
  )

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onPageIndexClick = useCallback((i: number) => table.setPageIndex(i), [])

  return (
    <Flex gap={6} p={10} justify="center">
      <Button
        size="small"
        variant="tertiary"
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.previousPage()}
      >
        Prev
      </Button>
      {pagination.map((pageNumber, index) =>
        typeof pageNumber === "string" ? (
          <Text
            key={`${index}-dots`}
            width={32}
            fs={16}
            color={getToken("text.low")}
            sx={{ textAlign: "center" }}
          >
            &#8230;
          </Text>
        ) : (
          <Button
            key={`${index}-page`}
            width={32}
            size="small"
            variant={pageNumber === currentPage ? "primary" : "tertiary"}
            onClick={() => onPageIndexClick(pageNumber - 1)}
            sx={{ textAlign: "center" }}
          >
            {pageNumber}
          </Button>
        ),
      )}
      <Button
        size="small"
        variant="tertiary"
        disabled={!table.getCanNextPage()}
        onClick={() => table.nextPage()}
      >
        Next
      </Button>
    </Flex>
  )
}
