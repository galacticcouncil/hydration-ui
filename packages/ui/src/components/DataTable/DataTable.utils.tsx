import {
  AccessorKeyColumnDef,
  ColumnDef,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { RowData, SortingState, TableOptions } from "@tanstack/table-core"
import { useMemo } from "react"

import { Skeleton } from "@/components/Skeleton"
import { useBreakpoints } from "@/theme"

export type UseDataTableOwnOptions = {
  paginated?: boolean
  expandable?: boolean | "single"
  isLoading?: boolean
  skeletonRowCount?: number
}

export type UseDataTableOptions<TData extends RowData> = Omit<
  TableOptions<TData>,
  "getCoreRowModel" | "getSortedRowModel"
> & {
  getCoreRowModel?: TableOptions<TData>["getCoreRowModel"]
  getSortedRowModel?: TableOptions<TData>["getSortedRowModel"]
} & UseDataTableOwnOptions

function isAccessorColumn<TData>(
  column: ColumnDef<TData>,
): column is AccessorKeyColumnDef<TData> {
  return "accessorKey" in column
}

export const useDataTable = <TData extends RowData>({
  isLoading = false,
  paginated = false,
  expandable = false,
  skeletonRowCount = 10,
  ...options
}: UseDataTableOptions<TData>) => {
  const { screen, gte } = useBreakpoints()

  const columnVisibility = useMemo(() => {
    if (!screen) return

    return options.columns.reduce(
      (prev, curr) => {
        const id = isAccessorColumn(curr)
          ? (curr.id ?? curr.accessorKey)
          : curr.id
        if (!id) return prev

        const visibilityKey = typeof id === "string" ? id.replace(".", "_") : id

        const visibility = curr.meta?.visibility
        const gteBp = curr.meta?.gteBp
        if (visibility !== undefined) {
          return {
            ...prev,
            [visibilityKey]: Array.isArray(visibility)
              ? visibility.includes(screen)
              : visibility,
          }
        } else if (gteBp) {
          return {
            ...prev,
            [visibilityKey]: gte(gteBp),
          }
        } else {
          return {
            ...prev,
            [visibilityKey]: true,
          }
        }
      },
      {} as Record<string | keyof TData, boolean>,
    )
  }, [options.columns, screen, gte])

  const data = useMemo(
    () => (isLoading ? Array(skeletonRowCount).fill({}) : options.data),
    [isLoading, skeletonRowCount, options.data],
  )

  const columns = useMemo(
    () =>
      isLoading
        ? options.columns.map((column) => ({
            ...column,
            enableSorting: false,
            cell: () => (
              <Skeleton sx={{ width: "min(80px, 100%)" }} height="1em" />
            ),
          }))
        : options.columns,
    [isLoading, options.columns],
  )

  return useReactTable({
    ...options,
    state: {
      columnVisibility,
      ...options.state,
    },
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: paginated ? getPaginationRowModel() : undefined,
    getExpandedRowModel: expandable ? getExpandedRowModel() : undefined,
    getRowCanExpand: () => !!expandable,
    getFilteredRowModel:
      typeof options.state?.globalFilter === "string"
        ? getFilteredRowModel()
        : undefined,
    meta: {
      isLoading,
    },
    autoResetPageIndex: false,
  })
}

export const updateTableSortWithPriority = <TColumn extends string>(
  state: SortingState,
  columnSortPriority: ReadonlyArray<TColumn>,
) => {
  // Sort the columns based on priority order
  return state.toSorted((a, b) => {
    const aPriority = columnSortPriority.indexOf(a.id as TColumn)
    const bPriority = columnSortPriority.indexOf(b.id as TColumn)

    // If both columns are in the priority list, sort by priority
    if (aPriority !== -1 && bPriority !== -1) {
      return aPriority - bPriority
    }

    // If only one column is in the priority list, it comes first
    if (aPriority !== -1) return -1
    if (bPriority !== -1) return 1

    // If neither is in the priority list, maintain stable order
    const aIndex = state.indexOf(a)
    const bIndex = state.indexOf(b)
    return aIndex - bIndex
  })
}
