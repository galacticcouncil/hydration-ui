import { DataTable, TableContainer } from "@galacticcouncil/ui/components"
import { useNavigate } from "@tanstack/react-router"

import { TablePaper } from "@/modules/borrow/components/TablePaper"
import { useMultiplyAssetsTableColumns } from "@/modules/borrow/multiply/components/MultiplyAssetsTable.columns"
import { useMultiplyReserves } from "@/modules/borrow/multiply/hooks/useMultiplyReserves"

export const MultiplyAssetsTable = () => {
  const columns = useMultiplyAssetsTableColumns()
  const { data, isLoading } = useMultiplyReserves()
  const navigate = useNavigate()

  return (
    <TableContainer as={TablePaper}>
      <DataTable
        skeletonRowCount={10}
        isLoading={isLoading}
        onRowClick={(row) =>
          navigate({
            to: "/borrow/multiply/$id",
            params: { id: row.assetId },
          })
        }
        fixedLayout
        data={data}
        columns={columns}
      />
    </TableContainer>
  )
}
