import { DataTable } from "components/DataTable"
import { Text } from "components/Typography/Text/Text"
import { useReactTable } from "hooks/useReactTable"
import { useMedia } from "react-use"
import { SuppliedAssetsMobileRow } from "sections/lending/ui/table/supplied-assets/SuppliedAssetsMobileRow"
import { SuppliedAssetsStats } from "sections/lending/ui/table/supplied-assets/SuppliedAssetsStats"
import {
  useSuppliedAssetsTableColumns,
  useSuppliedAssetsTableData,
} from "sections/lending/ui/table/supplied-assets/SuppliedAssetsTable.utils"
import { theme } from "theme"

export const SuppliedAssetsTable = () => {
  const { data, isLoading } = useSuppliedAssetsTableData()
  const columns = useSuppliedAssetsTableColumns()

  const table = useReactTable({
    data,
    columns,
    isLoading,
    skeletonRowCount: 6,
  })

  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <DataTable
      table={table}
      spacing="large"
      title="Your supplies"
      background="transparent"
      addons={<SuppliedAssetsStats />}
      renderRow={isDesktop ? undefined : SuppliedAssetsMobileRow}
      emptyFallback={
        <Text color="basic700" fs={14}>
          Nothing supplied yet
        </Text>
      }
    />
  )
}
