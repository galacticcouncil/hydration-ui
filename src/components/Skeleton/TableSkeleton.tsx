import { ColumnDef } from "@tanstack/react-table"
import { DataTable, TableProps } from "components/DataTable"
import { useReactTable } from "hooks/useReactTable"
import Skeleton from "react-loading-skeleton"

export type TableSkeletonProps = {
  className?: string
  colCount?: number
  rowCount?: number
  titleSkeleton?: boolean
  background?: string
  colSizes?: ReadonlyArray<number>
} & TableProps

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  className,
  colCount = 5,
  rowCount = 10,
  titleSkeleton = false,
  colSizes,
  ...props
}) => {
  const table = useReactTable({
    columns: generateCols(colCount, colSizes),
    data: [],
    skeletonRowCount: rowCount,
    isLoading: true,
  })
  return (
    <DataTable
      className={className}
      table={table}
      title={titleSkeleton ? <Skeleton width={200} /> : undefined}
      {...props}
    />
  )
}

function generateCols(count: number, colSizes?: ReadonlyArray<number>) {
  return Array(count)
    .fill({})
    .map<ColumnDef<any>>((_, index) => {
      const colSize = colSizes?.[index]

      return {
        id: `${index}`,
        ...(colSize ? { meta: { sx: { width: `${colSize}%` } } } : {}),
      }
    })
}
