import { DataTable, TableProps } from "components/DataTable"
import { useReactTable } from "hooks/useReactTable"
import Skeleton from "react-loading-skeleton"

export type TableSkeletonProps = {
  className?: string
  colCount?: number
  rowCount?: number
  titleSkeleton?: boolean
  background?: string
} & TableProps

export const TableSkeleton: React.FC<TableSkeletonProps> = ({
  className,
  colCount = 5,
  rowCount = 10,
  titleSkeleton = false,
  ...props
}) => {
  const table = useReactTable({
    columns: generateCols(colCount),
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

function generateCols(count: number) {
  return Array(count)
    .fill({})
    .map((_, index) => ({ id: `${index}` }))
}
