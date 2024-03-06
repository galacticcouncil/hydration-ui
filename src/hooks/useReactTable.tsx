import {
  getCoreRowModel,
  getSortedRowModel,
  useReactTable as useTanstackTable,
} from "@tanstack/react-table"
import { RowData, TableOptions } from "@tanstack/table-core"
import { useMemo } from "react"

import Skeleton from "react-loading-skeleton"
import { useMedia } from "react-use"
import { theme } from "theme"

type UseReactTableOptions<TData extends RowData> = Omit<
  TableOptions<TData>,
  "getCoreRowModel" | "getSortedRowModel"
> & {
  isLoading?: boolean
  skeletonRowCount?: number
  columnsHiddenOnMobile?: (keyof TData)[] | string[]
  getCoreRowModel?: TableOptions<TData>["getCoreRowModel"]
  getSortedRowModel?: TableOptions<TData>["getSortedRowModel"]
}

export const useReactTable = <TData extends RowData>({
  isLoading,
  skeletonRowCount = 10,
  columnsHiddenOnMobile,
  ...options
}: UseReactTableOptions<TData>) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const columnVisibility = useMemo(() => {
    if (!isDesktop && columnsHiddenOnMobile?.length) {
      return Object.fromEntries(
        columnsHiddenOnMobile.map((col) => [col, false]),
      )
    }
  }, [columnsHiddenOnMobile, isDesktop])

  const data = useMemo(
    () => (isLoading ? Array(skeletonRowCount).fill({}) : options.data),
    [isLoading, skeletonRowCount, options.data],
  )

  const columns = useMemo(
    () =>
      isLoading
        ? options.columns.map((column) => ({
            ...column,
            cell: () => (
              <Skeleton sx={{ width: "min(80px, 100%)" }} height="1em" />
            ),
          }))
        : options.columns,
    [isLoading, options.columns],
  )

  return useTanstackTable({
    ...options,
    state: {
      columnVisibility,
      ...options.state,
    },
    columns,
    data,
    getCoreRowModel: options.getCoreRowModel ?? getCoreRowModel(),
    getSortedRowModel: options.getSortedRowModel ?? getSortedRowModel(),
    meta: {
      isLoading,
    },
  })
}
