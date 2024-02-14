import { DataTable } from "components/DataTable"
import { Text } from "components/Typography/Text/Text"
import { useReactTable } from "hooks/useReactTable"
import { BorrowedAssetsStats } from "sections/lending/ui/table/borrowed-assets/BorrowedAssetsStats"
import {
  useBorrowedAssetsTableColumns,
  useBorrowedAssetsTableData,
} from "sections/lending/ui/table/borrowed-assets/BorrowedAssetsTable.utils"

export const BorrowedAssetsTable = () => {
  const { data, isLoading } = useBorrowedAssetsTableData()
  const columns = useBorrowedAssetsTableColumns()

  const table = useReactTable({
    data,
    columns,
    isLoading,
    skeletonRowCount: 6,
  })

  return (
    <DataTable
      table={table}
      spacing="large"
      title="Your borrows"
      addons={<BorrowedAssetsStats />}
      emptyFallback={
        <Text color="basic700" fs={14}>
          Nothing borrowed yet
        </Text>
      }
    />
  )
}
