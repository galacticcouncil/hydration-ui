import { DataTable, TableContainer } from "@galacticcouncil/ui/components"
import { useNavigate } from "@tanstack/react-router"

import { TablePaper } from "@/modules/borrow/components/TablePaper"
import { useMultiplyPairsTableColumns } from "@/modules/borrow/multiply/components/MultiplyPairsTable.columns"
import { MultiplyPair } from "@/modules/borrow/multiply/hooks/useMultiplyPairs"

export type MultiplyPairsTableProps = {
  pairs: MultiplyPair[]
}

export const MultiplyPairsTable: React.FC<MultiplyPairsTableProps> = ({
  pairs,
}) => {
  const columns = useMultiplyPairsTableColumns()
  const navigate = useNavigate()

  return (
    <TableContainer as={TablePaper}>
      <DataTable
        skeletonRowCount={10}
        onRowClick={(row) =>
          navigate({
            to: "/borrow/multiply/$id",
            params: { id: row.id },
          })
        }
        fixedLayout
        data={pairs}
        columns={columns}
      />
    </TableContainer>
  )
}
