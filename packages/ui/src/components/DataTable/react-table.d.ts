import "@tanstack/react-table"

import { ThemeUIStyleObject } from "@theme-ui/css"

import { ScreenBreakpoint, ScreenType } from "@/theme"

type ContextSxFunction<TData extends RowData> = (
  rowData: TData,
) => ThemeUIStyleObject

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData> {
    readonly className?: string
    readonly sx?: ThemeUIStyleObject
    readonly sxFn?: ContextSxFunction<TData>
    readonly visibility?: ScreenType[] | boolean
    readonly gteBp?: ScreenBreakpoint
  }

  interface TableMeta {
    readonly isLoading: boolean
  }
}
