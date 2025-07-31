import { useMarketAssetsData } from "@galacticcouncil/money-market/hooks"
import {
  DataTable,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useNavigate } from "@tanstack/react-router"

import { useMarketAssetsTableColumns } from "@/modules/borrow/markets/components/MarketAssetsTable.columns"

type MarketAssetsTableProps = {
  search?: string
}

export const MarketAssetsTable: React.FC<MarketAssetsTableProps> = ({
  search,
}) => {
  const { data, isLoading } = useMarketAssetsData()
  const columns = useMarketAssetsTableColumns()

  const navigate = useNavigate()

  return (
    <TableContainer as={Paper}>
      <DataTable
        globalFilter={search}
        isLoading={isLoading}
        onRowClick={(row) =>
          navigate({
            to: `/borrow/markets/${row.underlyingAsset}`,
          })
        }
        data={data}
        columns={columns}
      />
    </TableContainer>
  )
}
