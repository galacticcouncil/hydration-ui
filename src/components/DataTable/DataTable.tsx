import {
  flexRender,
  Row,
  Table as TableDefinition,
} from "@tanstack/react-table"
import { ReactNode } from "react"
import { TableSortHead } from "./components/TableSortHead"
import {
  Table,
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
  onRowClick?: (row?: Row<T> | Record<string, any>) => void
} & TableProps

export function DataTable<T extends Record<string, any>>({
  table,
  title,
  action,
  addons,
  className,
  spacing = "medium",
  size = "medium",
  background = "darkBlue700",
  borderless,
  striped,
  hoverable,
  onRowClick,
}: DataTableProps<T>) {
  const tableProps = {
    spacing,
    size,
    borderless,
    striped,
    hoverable,
  }

  return (
    <TableContainer className={className} background={background}>
      {(title || action) && (
        <TableTitleContainer spacing={spacing}>
          {title && <TableTitle>{title}</TableTitle>}
          <div sx={{ ml: "auto" }}>{action}</div>
        </TableTitleContainer>
      )}

      {addons && <TableAddons spacing={spacing}>{addons}</TableAddons>}

      <Table
        {...tableProps}
        data-loading={table.options.meta?.isLoading ? "true" : "false"}
      >
        <TableHeader>
          {table
            .getHeaderGroups()
            .filter((headerGroup) =>
              headerGroup.headers.some(
                (header) => !!header.column.columnDef.header,
              ),
            )
            .map((headerGroup) => (
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
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-selected={row.getIsSelected()}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
            >
              {row.getVisibleCells().map((cell) => {
                const { meta } = cell.getContext().cell.column.columnDef
                return (
                  <TableCell
                    key={cell.id}
                    className={meta?.className}
                    sx={meta?.sx}
                  >
                    {onRowClick ? (
                      <div
                        css={{ display: "inline" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </div>
                    ) : (
                      flexRender(cell.column.columnDef.cell, cell.getContext())
                    )}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
