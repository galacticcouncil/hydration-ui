import { useSupplyAssetsData } from "@galacticcouncil/money-market/hooks"
import {
  DataTable,
  Paper,
  Separator,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useNavigate } from "@tanstack/react-router"

import { SupplyAssetsHeader } from "@/modules/borrow/dashboard/components/SupplyAssetsHeader"
import { useSupplyAssetsTableColumns } from "@/modules/borrow/dashboard/components/SupplyAssetsTable.columns"

export const SupplyAssetsTable = () => {
  const columns = useSupplyAssetsTableColumns()
  const { data, isLoading } = useSupplyAssetsData({ showAll: true })
  const navigate = useNavigate()

  return (
    <Paper>
      <SupplyAssetsHeader />
      <Separator />
      <TableContainer>
        <DataTable
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
    </Paper>
  )
}
