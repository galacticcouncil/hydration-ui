import { useSupplyAssetsData } from "@galacticcouncil/money-market/hooks"
import {
  DataTable,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import {
  getAssetIdFromAddress,
  MONEY_MARKET_STRATEGY_ASSETS,
} from "@galacticcouncil/utils"
import { useNavigate } from "@tanstack/react-router"
import { useMemo } from "react"
import { sortBy } from "remeda"

import { TablePaper } from "@/modules/borrow/components/TablePaper"
import { StackedTable } from "@/modules/borrow/dashboard/components/StackedTable"
import { useSupplyAssetsTableColumns } from "@/modules/borrow/dashboard/components/supply-assets/SupplyAssetsTable.columns"

export const SupplyAssetsTable = () => {
  const baseColumns = useSupplyAssetsTableColumns("base")
  const strategyColumns = useSupplyAssetsTableColumns("strategy")
  const { data, isLoading } = useSupplyAssetsData({ showAll: true })
  const navigate = useNavigate()
  const { isMobile } = useBreakpoints()

  const { baseAssets, strategyAssets } = useMemo(() => {
    const group = Object.groupBy(data, (item) =>
      MONEY_MARKET_STRATEGY_ASSETS.includes(
        getAssetIdFromAddress(item.underlyingAsset),
      )
        ? "strategyAssets"
        : "baseAssets",
    )

    const sortedStrategyAssets = sortBy(group.strategyAssets ?? [], (asset) =>
      MONEY_MARKET_STRATEGY_ASSETS.indexOf(
        getAssetIdFromAddress(asset.underlyingAsset),
      ),
    )

    return {
      baseAssets: group.baseAssets ?? [],
      strategyAssets: sortedStrategyAssets,
    }
  }, [data])

  return isMobile ? (
    <Paper>
      <StackedTable
        skeletonRowCount={4}
        isLoading={isLoading}
        data={strategyAssets}
        columns={strategyColumns}
      />
      <StackedTable
        skeletonRowCount={4}
        isLoading={isLoading}
        data={baseAssets}
        columns={baseColumns}
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
        data={strategyAssets}
        columns={strategyColumns}
      />
      <DataTable
        skeletonRowCount={4}
        isLoading={isLoading}
        onRowClick={(row) =>
          navigate({
            to: `/borrow/markets/${row.underlyingAsset}`,
          })
        }
        fixedLayout
        data={baseAssets}
        columns={baseColumns}
      />
    </TableContainer>
  )
}
