import { useSupplyAssetsData } from "@galacticcouncil/money-market/hooks"
import {
  DataTable,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useNavigate } from "@tanstack/react-router"

import { StackedTable } from "@/modules/borrow/dashboard/components/StackedTable"
import { useSupplyAssetsTableColumns } from "@/modules/borrow/dashboard/components/supply-assets/SupplyAssetsTable.columns"

export const SupplyAssetsTable = () => {
  const columns = useSupplyAssetsTableColumns()
  const { data, isLoading } = useSupplyAssetsData({ showAll: true })
  const navigate = useNavigate()
  const { isMobile } = useBreakpoints()

  return isMobile ? (
    <Paper>
      <StackedTable
        skeletonRowCount={4}
        isLoading={isLoading}
        data={data}
        columns={columns}
      />
    </Paper>
  ) : (
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
