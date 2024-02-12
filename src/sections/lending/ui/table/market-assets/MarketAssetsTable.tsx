import { DataTable } from "components/DataTable"
import { useReactTable } from "hooks/useReactTable"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useMarketAssetsTableColumns } from "sections/lending/ui/table/market-assets/MarketAssetsTable.utils"

export const MarketAssetsTable = () => {
  const { reserves, loading } = useAppDataContext()
  const columns = useMarketAssetsTableColumns()

  const table = useReactTable({
    data: reserves,
    columns,
    isLoading: loading,
  })
  return <DataTable table={table} spacing="large" title="Available Assets" />
}
