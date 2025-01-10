import { SortDirection } from "@tanstack/react-table"

import { CaretDown } from "@/assets/icons"

export type { TableProps, TableSize } from "./Table.styled"
export {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
} from "./Table.styled"

import {
  TableHead as TableHeadPrimitive,
  TableHeadSortIndicator,
} from "./Table.styled"

export type TableHeadProps = React.ComponentPropsWithoutRef<
  typeof TableHeadPrimitive
> & {
  canSort?: boolean
  sortDirection?: false | SortDirection
  onSort?: (event: unknown) => void
}

export const TableHead: React.FC<TableHeadProps> = ({
  canSort = false,
  sortDirection = false,
  onSort,
  children,
  ...props
}) => {
  const asc = sortDirection === "asc" || sortDirection === false ? 1 : 0
  const desc = sortDirection === "desc" || sortDirection === false ? 1 : 0
  return (
    <TableHeadPrimitive {...props} canSort={canSort} onClick={onSort}>
      {children}
      {canSort && (
        <TableHeadSortIndicator>
          <CaretDown css={{ opacity: desc }} />
          <CaretDown css={{ opacity: asc }} />
        </TableHeadSortIndicator>
      )}
    </TableHeadPrimitive>
  )
}
