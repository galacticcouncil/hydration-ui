import { SortDirection } from "@tanstack/react-table"
import { TableHead } from "components/DataTable/DataTable.styled"
import { FC, ReactNode } from "react"
import CaretIcon from "assets/icons/CaretIcon.svg?react"

type TableSortHeadProps = {
  canSort: boolean
  sortDirection?: false | SortDirection
  onSort?: (event: unknown) => void
  className?: string
  children: ReactNode
}

export const TableSortHead: FC<TableSortHeadProps> = ({
  canSort,
  sortDirection,
  onSort,
  className,
  children,
}) => {
  const isSorting =
    canSort && sortDirection !== undefined && onSort !== undefined
  const asc = sortDirection === "asc" || sortDirection === false ? 1 : 0
  const desc = sortDirection === "desc" || sortDirection === false ? 1 : 0

  return (
    <TableHead canSort={canSort} onClick={onSort} className={className}>
      {children}
      {isSorting && (
        <div
          css={{ display: "inline-block", position: "relative" }}
          sx={{ width: 8, height: 8, ml: 6 }}
        >
          <CaretIcon
            css={{
              position: "absolute",
              top: -1,
              left: 0,
              rotate: "180deg",
              opacity: asc,
            }}
          />
          <CaretIcon
            css={{ position: "absolute", bottom: -1, left: 0, opacity: desc }}
          />
        </div>
      )}
    </TableHead>
  )
}
