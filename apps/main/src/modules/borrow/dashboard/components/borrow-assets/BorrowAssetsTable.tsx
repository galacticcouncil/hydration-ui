import { useBorrowAssetsData } from "@galacticcouncil/money-market/hooks"
import {
  DataTable,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useNavigate } from "@tanstack/react-router"

import { useBorrowAssetsTableColumns } from "@/modules/borrow/dashboard/components/borrow-assets/BorrowAssetsTable.columns"

export const BorrowAssetsTable = () => {
  const columns = useBorrowAssetsTableColumns()
  const { data, isLoading } = useBorrowAssetsData()
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
