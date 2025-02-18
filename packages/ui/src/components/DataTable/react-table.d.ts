import "@tanstack/react-table"

import { ThemeUIStyleObject } from "@theme-ui/css"

import { ScreenBreakpoint, ScreenType } from "@/theme"

declare module "@tanstack/react-table" {
  interface ColumnMeta {
    readonly className?: string
    readonly sx?: ThemeUIStyleObject
    readonly visibility?: ScreenType[]
    readonly gteBp?: ScreenBreakpoint
  }
  interface TableMeta {
    readonly isLoading: boolean
  }
}
