import "@tanstack/react-table"

import { ThemeUIStyleObject } from "@theme-ui/css"

import { ScreenType } from "@/theme"

declare module "@tanstack/react-table" {
  interface ColumnMeta {
    readonly className?: string
    readonly sx?: ThemeUIStyleObject
    readonly visibility?: ScreenType[]
  }
  interface TableMeta {
    readonly isLoading: boolean
  }
}
