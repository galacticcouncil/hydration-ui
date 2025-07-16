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
import { getToken } from "@/utils"

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
  const ascColor =
    sortDirection === "asc" ? getToken("text.medium") : getToken("text.low")
  const descColor =
    sortDirection === "desc" ? getToken("text.medium") : getToken("text.low")

  return (
    <TableHeadPrimitive
      {...props}
      canSort={canSort}
      isSorting={!!sortDirection}
      onClick={onSort}
    >
      {children}
      {canSort && (
        <TableHeadSortIndicator>
          <CaretDown
            sx={{
              color: descColor,
              opacity: sortDirection === "asc" ? 0.25 : 1,
            }}
          />
          <CaretDown
            sx={{
              color: ascColor,
              opacity: sortDirection === "desc" ? 0.25 : 1,
            }}
          />
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

export const TableRowDetailsExpand: FC<ComponentProps<typeof Button>> = ({
  children,
  sx,
  onClick,
  ...props
}) => {
  return (
    <Flex gap={8} align="center" justify="flex-end" sx={{ overflow: "hidden" }}>
      {children}
      <ButtonTransparent
        sx={{ flexShrink: 0, size: 16, ...sx }}
        onClick={(e) => {
          e.preventDefault()
          onClick?.(e)
        }}
        {...props}
      >
        <ChevronRight size={16} />
      </ButtonTransparent>
    </Flex>
  )
}
