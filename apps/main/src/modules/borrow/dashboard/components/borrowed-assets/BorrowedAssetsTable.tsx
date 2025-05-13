import { useBorrowedAssetsData } from "@galacticcouncil/money-market/hooks"
import {
  DataTable,
  Paper,
  Separator,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useNavigate } from "@tanstack/react-router"

import { BorrowedAssetsHeader } from "@/modules/borrow/dashboard/components/borrowed-assets/BorrowedAssetsHeader"
import { useBorrowedAssetsTableColumns } from "@/modules/borrow/dashboard/components/borrowed-assets/BorrowedAssetsTable.columns"

export const BorrowedAssetsTable = () => {
  const columns = useBorrowedAssetsTableColumns()
  const { data, isLoading } = useBorrowedAssetsData()
  const navigate = useNavigate()

  return (
    <Paper>
      <BorrowedAssetsHeader />
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
