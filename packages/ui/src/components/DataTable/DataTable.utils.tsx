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
import { RowData, TableOptions } from "@tanstack/table-core"
import { useMemo } from "react"
import { range } from "remeda"

import { Skeleton } from "@/components/Skeleton"
import { useBreakpoints } from "@/theme"

export type UseDataTableOwnOptions = {
  paginated?: boolean
  expandable?: boolean
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
        const visibility = curr.meta?.visibility
        const gteBp = curr.meta?.gteBp
        if (visibility) {
          return {
            ...prev,
            [id]: visibility.includes(screen),
          }
        } else if (gteBp) {
          return {
            ...prev,
            [id]: gte(gteBp),
          }
        } else {
          return {
            ...prev,
            [id]: true,
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
    getRowCanExpand: () => expandable,
    getFilteredRowModel:
      typeof options.state?.globalFilter === "string"
        ? getFilteredRowModel()
        : undefined,
    meta: {
      isLoading,
    },
  })
}

const PAGINATION_DOTS = "..."

export function getPaginationRange(
  totalPages: number,
  currentPage: number,
): Array<number | string> {
  const maxLength = 5
  const pagination = []

  pagination.push(1)

  if (totalPages <= maxLength) {
    pagination.push(...range(2, totalPages + 1))

    return pagination
  }

  const innerMaxLength = maxLength - 2
  const sideLength = Math.floor((innerMaxLength - 1) / 2)

  let startPage = currentPage - sideLength
  let endPage = currentPage + sideLength

  if (startPage <= 1) {
    startPage = 2
    endPage = startPage + innerMaxLength - 1
  }
  if (endPage >= totalPages) {
    endPage = totalPages - 1
    startPage = endPage - innerMaxLength + 1
  }

  if (startPage > 2) {
    pagination.push(PAGINATION_DOTS)
  }

  pagination.push(...range(startPage, endPage + 1))

  if (endPage < totalPages - 1) {
    pagination.push(PAGINATION_DOTS)
  }

  pagination.push(totalPages)

  return pagination
}
