import { useBorrowAssetsData } from "@galacticcouncil/money-market/hooks"
import {
  DataTable,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useNavigate } from "@tanstack/react-router"

import { useDataTableUrlSorting } from "@/hooks/useDataTableUrlSorting"
import { TablePaper } from "@/modules/borrow/components/TablePaper"
import { useBorrowAssetsTableColumns } from "@/modules/borrow/dashboard/components/borrow-assets/BorrowAssetsTable.columns"
import { StackedTable } from "@/modules/borrow/dashboard/components/StackedTable"

export const BorrowAssetsTable = () => {
  const columns = useBorrowAssetsTableColumns()
  const { data, isLoading } = useBorrowAssetsData()
  const navigate = useNavigate()
  const { isMobile } = useBreakpoints()

  const sort = useDataTableUrlSorting("/borrow/dashboard", "borrowSort")

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
    <TableContainer as={TablePaper}>
      <DataTable
        skeletonRowCount={4}
        isLoading={isLoading}
        onRowClick={(row) =>
          navigate({
            to: `/borrow/markets/${row.underlyingAsset}`,
          })
        }
        fixedLayout
        data={data}
        columns={columns}
        {...sort}
      />
    </TableContainer>
  )
}
