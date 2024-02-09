import { DataTable } from "components/DataTable"
import { useReactTable } from "hooks/useReactTable"
import { useEffect } from "react"
import {
  useSupplyAssetsTableColumns,
  useSupplyAssetsTableData,
} from "sections/lending/ui/table/supply-assets/SupplyAssetsTable.utils"

export const SupplyAssetsTable = () => {
  const { data, isLoading } = useSupplyAssetsTableData()

  const columns = useSupplyAssetsTableColumns()

  const table = useReactTable({
    data,
    columns,
    isLoading,
    skeletonRowCount: 6,
  })

  /* useEffect(() => {
    console.log("data", data)
  }, [data]) */

  //return <pre sx={{ color: "white" }}>{JSON.stringify(table, null, 2)}</pre>

  return <DataTable table={table} spacing="large" title="Assets to supply" />
}
