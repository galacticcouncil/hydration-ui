import { SortDirection } from "@tanstack/react-table"

import { CaretDown, ChevronRight } from "@/assets/icons"

export type { TableProps, TableSize } from "./Table.styled"
export {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHeader,
  TableRow,
  TableRowOverride,
} from "./Table.styled"

import { ComponentProps, FC } from "react"

import { Button, ButtonTransparent } from "@/components/Button"
import { Flex } from "@/components/Flex"

import {
  SExpandedTableRowHorizontalSeparator,
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

export const ExpandedTableRowHorizontalSeparator: FC<
  Omit<
    ComponentProps<typeof SExpandedTableRowHorizontalSeparator>,
    "orientation"
  >
> = (props) => {
  return (
    <SExpandedTableRowHorizontalSeparator orientation="horizontal" {...props} />
  )
}

export const TableRowAction: FC<ComponentProps<typeof Button>> = ({
  children,
  onClick,
  ...props
}) => {
  return (
    <Button
      variant="tertiary"
      outline
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(e)
      }}
      {...props}
    >
      {children}
    </Button>
  )
}

export const TableRowActionMobile: FC<ComponentProps<typeof Button>> = ({
  children,
  sx,
  ...props
}) => {
  return (
    <Flex gap={8} align="center" justify="flex-end" sx={{ overflow: "hidden" }}>
      {children}
      <ButtonTransparent sx={{ flexShrink: 0, ...sx }} {...props}>
        <ChevronRight size={16} />
      </ButtonTransparent>
    </Flex>
  )
}
