import { Row, Table } from "@tanstack/react-table"
import { createContext, FC, ReactNode, useContext, useMemo } from "react"

type Context = {
  readonly table: Table<unknown>
  readonly row: Row<unknown>
  readonly expandable: boolean | "single" | undefined
}

const Context = createContext<Context | null>(null)

export const useDataTableRowContext = () => {
  const context = useContext(Context)

  if (!context) {
    throw new Error("DataTable context provider not found")
  }

  return context
}

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly table: Table<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly row: Row<any>
  readonly expandable: boolean | "single" | undefined
  readonly children: ReactNode
}

export const DataTableRowProvider: FC<Props> = ({
  table,
  row,
  expandable,
  children,
}) => {
  return (
    <Context.Provider
      value={useMemo(
        () => ({ table, row, expandable }),
        [table, row, expandable],
      )}
    >
      {children}
    </Context.Provider>
  )
}
