import { useSuppliedAssetsData } from "@galacticcouncil/money-market/hooks"
import {
  DataTable,
  Paper,
  Separator,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useNavigate } from "@tanstack/react-router"

import { SuppliedAssetsHeader } from "@/modules/borrow/dashboard/components/supplied-assets/SuppliedAssetsHeader"
import { useSuppliedAssetsTableColumns } from "@/modules/borrow/dashboard/components/supplied-assets/SuppliedAssetsTable.columns"

export const SuppliedAssetsTable = () => {
  const columns = useSuppliedAssetsTableColumns()
  const { data, isLoading } = useSuppliedAssetsData()
  const navigate = useNavigate()

  return (
    <Paper>
      <SuppliedAssetsHeader />
      <Separator />
      <TableContainer>
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
    </Paper>
  )
}
