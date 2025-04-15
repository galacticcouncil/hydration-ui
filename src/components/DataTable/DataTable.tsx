import {
  flexRender,
  Row,
  Table as TableDefinition,
} from "@tanstack/react-table"
import { Fragment, ReactNode } from "react"
import { TableSortHead } from "./components/TableSortHead"
import {
  DEFAULT_DATA_TABLE_BACKGROUND,
  Table,
  TableAction,
  TableAddons,
  TableBody,
  TableCell,
  TableContainer,
  TableHeader,
  TableProps,
  TableRow,
  TableTitle,
  TableTitleContainer,
} from "./DataTable.styled"

type DataTableProps<T> = {
  table: TableDefinition<T>
  className?: string
  title?: ReactNode
  action?: ReactNode
  addons?: ReactNode
  emptyFallback?: ReactNode
  renderRow?: (row: Row<T>) => ReactNode
  onRowClick?: (row: Row<T>) => void
} & TableProps

export function DataTable<T extends Record<string, any>>({
  table,
  title,
  action,
  addons,
  className,
  fixedLayout = false,
  spacing = "medium",
  size = "medium",
  background = DEFAULT_DATA_TABLE_BACKGROUND,
  borderless,
  striped,
  hoverable,
  customContainer,
  onRowClick,
  emptyFallback,
  renderRow,
}: DataTableProps<T>) {
  const tableProps = {
    spacing,
    size,
    borderless,
    striped,
    hoverable,
    fixedLayout,
  }

  const headerGroups = table
    .getHeaderGroups()
    .filter((headerGroup) =>
      headerGroup.headers.some((header) => !!header.column.columnDef.header),
    )
  const rows = table.getRowModel().rows
  const hasRows = rows.length > 0
  const isLoading = table.options.meta?.isLoading ?? false

  const shouldRenderFallback = emptyFallback && !isLoading && !hasRows
  const shouldRenderAddons = !shouldRenderFallback && addons

  const shouldRenderRows = !!renderRow && !isLoading
  const shouldRenderTable = !shouldRenderRows

  return (
    <TableContainer
      className={className}
      background={background}
      customContainer={customContainer}
    >
      {(title || action) && (
        <TableTitleContainer
          spacing={spacing}
          customContainer={customContainer}
        >
          {title && <TableTitle>{title}</TableTitle>}
          <TableAction>{action}</TableAction>
        </TableTitleContainer>
      )}

      {shouldRenderAddons && (
        <TableAddons spacing={spacing}>{addons}</TableAddons>
      )}

      {shouldRenderRows &&
        rows.map((row) => <Fragment key={row.id}>{renderRow(row)}</Fragment>)}

      {shouldRenderTable && (
        <Table
          {...tableProps}
          data-loading={`${isLoading}`}
          css={{ display: shouldRenderFallback ? "none" : "table" }}
        >
          <TableHeader>
            {headerGroups.map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const { meta } = header.getContext().column.columnDef
                  return (
                    <TableSortHead
                      key={header.id}
                      className={meta?.className}
                      sx={meta?.sx}
                      canSort={header.column.getCanSort()}
                      sortDirection={header.column.getIsSorted()}
                      onSort={header.column.getToggleSortingHandler()}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableSortHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                data-selected={row.getIsSelected()}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                css={!!onRowClick && { cursor: "pointer" }}
              >
                {row.getVisibleCells().map((cell) => {
                  const { meta } = cell.getContext().cell.column.columnDef
                  return (
                    <TableCell
                      key={cell.id}
                      className={meta?.className}
                      sx={meta?.sx}
                    >
                      {onRowClick && !isLoading ? (
                        <div
                          css={{
                            display: "inline-flex",
                            width: "fit-content",
                            cursor: "auto",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </div>
                      ) : (
                        flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )
                      )}
                    </TableCell>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {shouldRenderFallback && (
        <TableAddons spacing={spacing}>{emptyFallback}</TableAddons>
      )}
    </TableContainer>
  )
}
