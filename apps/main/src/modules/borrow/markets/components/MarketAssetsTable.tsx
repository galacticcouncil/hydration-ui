import { useMarketAssetsData } from "@galacticcouncil/money-market/hooks"
import {
  DataTable,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"

import { useDataTableUrlSorting } from "@/hooks/useDataTableUrlSorting"
import { useNavigateToReserve } from "@/modules/borrow/hooks/useNavigateToReserve"
import { useMarketAssetsTableColumns } from "@/modules/borrow/markets/components/MarketAssetsTable.columns"

type MarketAssetsTableProps = {
  search?: string
}

export const MarketAssetsTable: React.FC<MarketAssetsTableProps> = ({
  search,
}) => {
  const { data, isLoading } = useMarketAssetsData()
  const columns = useMarketAssetsTableColumns()
  const navigateToReserve = useNavigateToReserve()

  return (
    <TableContainer as={Paper}>
      <DataTable
        globalFilter={search}
        isLoading={isLoading}
        onRowClick={(row) => navigateToReserve(row.underlyingAsset)}
        data={data}
        columns={columns}
        {...useDataTableUrlSorting("/borrow/markets/", "sort")}
      />
    </TableContainer>
  )
}
