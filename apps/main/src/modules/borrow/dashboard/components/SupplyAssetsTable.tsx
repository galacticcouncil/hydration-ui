import {
  DataTable,
  Paper,
  Separator,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useNavigate } from "@tanstack/react-router"

import { SupplyAssetsHeader } from "@/modules/borrow/dashboard/components/SupplyAssetsHeader"
import {
  MOCK_DATA,
  useSupplyAssetsTableColumns,
} from "@/modules/borrow/dashboard/components/SupplyAssetsTable.columns"

export const SupplyAssetsTable = () => {
  const columns = useSupplyAssetsTableColumns()
  const navigate = useNavigate()

  return (
    <Paper>
      <SupplyAssetsHeader />
      <Separator />
      <TableContainer>
        <DataTable
          onRowClick={(row) =>
            navigate({
              to: `/borrow/markets/${row.underlyingAsset}`,
            })
          }
          fixedLayout
          hoverable
          data={MOCK_DATA}
          columns={columns}
        />
      </TableContainer>
    </Paper>
  )
}
