import { useNavigate } from "@tanstack/react-location"
import { DataTable } from "components/DataTable"
import { useReactTable } from "hooks/useReactTable"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { useMarketAssetsTableColumns } from "sections/lending/ui/table/market-assets/MarketAssetsTable.utils"

export const MarketAssetsTable = () => {
  const { reserves, loading } = useAppDataContext()
  const columns = useMarketAssetsTableColumns()
  const { currentMarket } = useProtocolDataContext()

  const table = useReactTable({
    data: reserves,
    columns,
    isLoading: loading,
  })

  const navigate = useNavigate()

  return (
    <DataTable
      table={table}
      spacing="large"
      title="Available Assets"
      hoverable
      onRowClick={(row) =>
        navigate({
          to: ROUTES.reserveOverview(
            row?.original.underlyingAsset,
            currentMarket,
          ),
        })
      }
    />
  )
}
