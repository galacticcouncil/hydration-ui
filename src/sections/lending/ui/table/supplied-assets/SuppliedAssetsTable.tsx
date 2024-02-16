import { DataTable } from "components/DataTable"
import { Text } from "components/Typography/Text/Text"
import { useReactTable } from "hooks/useReactTable"
import { SuppliedAssetsStats } from "sections/lending/ui/table/supplied-assets/SuppliedAssetsStats"
import {
  useSuppliedAssetsTableColumns,
  useSuppliedAssetsTableData,
} from "sections/lending/ui/table/supplied-assets/SuppliedAssetsTable.utils"

export const SuppliedAssetsTable = () => {
  const { data, isLoading } = useSuppliedAssetsTableData()
  const columns = useSuppliedAssetsTableColumns()

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
      title="Your supplies"
      background="transparent"
      addons={<SuppliedAssetsStats />}
      emptyFallback={
        <Text color="basic700" fs={14}>
          Nothing supplied yet
        </Text>
      }
    />
  )
}
