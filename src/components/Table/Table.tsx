import { ReactNode } from "react"
import { Button } from "components/Button/Button"
import { SortDirection } from "@tanstack/react-table"
import { STableHeader } from "components/Table/Table.styled"
import { ReactComponent as CaretIcon } from "assets/icons/CaretIcon.svg"

export const TableAction = (props: {
  icon: ReactNode
  onClick: () => void
  children: ReactNode
}) => {
  return (
    <Button size="small" sx={{ p: "9px 12px" }} onClick={props.onClick}>
      <div sx={{ flex: "row", align: "center" }}>
        {props.icon}
        {props.children}
      </div>
    </Button>
  )
}

export const TableHeader = (props: {
  canSort: boolean
  sortDirection?: false | SortDirection
  onSort?: (event: unknown) => void
  children: ReactNode
}) => {
  const { canSort, sortDirection, onSort, children } = props
  const isSorting =
    canSort && sortDirection !== undefined && onSort !== undefined
  const asc = sortDirection === "asc" || sortDirection === false ? 1 : 0
  const desc = sortDirection === "desc" || sortDirection === false ? 1 : 0

  return (
    <STableHeader canSort={canSort} onClick={onSort}>
      <div sx={{ flex: "row", align: "center" }}>
        {children}
        {isSorting && (
          <div sx={{ flex: "column", gap: 2, ml: 6 }}>
            <CaretIcon css={{ rotate: "180deg", opacity: asc }} />
            <CaretIcon css={{ opacity: desc }} />
          </div>
        )}
      </div>
    </STableHeader>
  )
}
