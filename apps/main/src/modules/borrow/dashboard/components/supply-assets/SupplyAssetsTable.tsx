import { useSupplyAssetsData } from "@galacticcouncil/money-market/hooks"
import {
  DataTable,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useNavigate } from "@tanstack/react-router"

import { useSupplyAssetsTableColumns } from "@/modules/borrow/dashboard/components/supply-assets/SupplyAssetsTable.columns"

export const SupplyAssetsTable = () => {
  const columns = useSupplyAssetsTableColumns()
  const { data, isLoading } = useSupplyAssetsData({ showAll: true })
  const navigate = useNavigate()

  return (
    <TableContainer as={Paper}>
      <DataTable
        skeletonRowCount={4}
        isLoading={isLoading}
        onRowClick={(row) =>
          navigate({
            to: `/borrow/markets/${row.underlyingAsset}`,
          })
        }
        fixedLayout
        hoverable
        data={data}
        columns={columns}
      />
    </TableContainer>
  )
}
