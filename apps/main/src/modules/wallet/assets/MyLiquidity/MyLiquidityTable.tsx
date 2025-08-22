import {
  DataTable,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { FC } from "react"

import { LiquidityDetailExpanded } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailExpanded"
import {
  MyLiquidityTableColumnId,
  useMyLiquidityColumns,
} from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.columns"
import { LiquidityPositionByAsset } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"

type Props = {
  readonly searchPhrase: string
  readonly data: Array<LiquidityPositionByAsset>
  readonly isLoading: boolean
}

export const MyLiquidityTable: FC<Props> = ({
  searchPhrase,
  data,
  isLoading,
}) => {
  const { isMobile } = useBreakpoints()
  const columns = useMyLiquidityColumns()

  return (
    <TableContainer as={Paper}>
      <DataTable
        data={data}
        columns={columns}
        paginated
        pageSize={10}
        isLoading={isLoading}
        initialSorting={[
          { id: MyLiquidityTableColumnId.CurrentValue, desc: true },
        ]}
        globalFilter={searchPhrase}
        globalFilterFn={(row) =>
          row.original.asset.symbol
            .toLowerCase()
            .includes(searchPhrase.toLowerCase()) ||
          row.original.asset.name
            .toLowerCase()
            .includes(searchPhrase.toLowerCase())
        }
        expandable={isMobile ? false : "single"}
        getIsExpandable={({ positions }) => positions.length > 1}
        renderSubComponent={({ asset, positions }) => (
          <LiquidityDetailExpanded asset={asset} positions={positions} />
        )}
      />
    </TableContainer>
  )
}
