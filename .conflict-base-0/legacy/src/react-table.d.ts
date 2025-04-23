import "@tanstack/react-table"
import { SxProps } from "jsx/jsx-sx-convert"

declare module "@tanstack/react-table" {
  interface ColumnMeta {
    readonly className?: string
    readonly sx?: SxProps
  }
  interface TableMeta {
    readonly isLoading?: boolean
  }
}
