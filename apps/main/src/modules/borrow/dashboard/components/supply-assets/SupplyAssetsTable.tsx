import { useSupplyAssetsData } from "@galacticcouncil/money-market/hooks"
import {
  DataTable,
  Paper,
  TableContainer,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import {
  getAssetIdFromAddress,
  ISOLATED_MODE_ASSETS,
  MONEY_MARKET_STRATEGY_ASSETS,
} from "@galacticcouncil/utils"
import { useMemo, useState } from "react"
import { sortBy } from "remeda"

import { useDataTableUrlSorting } from "@/hooks/useDataTableUrlSorting"
import {
  StrategySupplyModal,
  StrategySupplyModalProps,
} from "@/modules/borrow/components/StrategySupplyModal"
import { TablePaper } from "@/modules/borrow/components/TablePaper"
import { StackedTable } from "@/modules/borrow/dashboard/components/StackedTable"
import { useSupplyAssetsTableColumns } from "@/modules/borrow/dashboard/components/supply-assets/SupplyAssetsTable.columns"
import { useNavigateToReserve } from "@/modules/borrow/hooks/useNavigateToReserve"

export const SupplyAssetsTable = () => {
  const [modalProps, setModalProps] = useState<StrategySupplyModalProps>()
  const baseColumns = useSupplyAssetsTableColumns("base")
  const strategyColumns = useSupplyAssetsTableColumns("strategy", setModalProps)

  const { data, isLoading } = useSupplyAssetsData({ showAll: true })
  const navigateToReserve = useNavigateToReserve()
  const { isMobile } = useBreakpoints()

  const { baseAssets, strategyAssets } = useMemo(() => {
    const group = Object.groupBy(data, (item) =>
      MONEY_MARKET_STRATEGY_ASSETS.includes(
        getAssetIdFromAddress(item.underlyingAsset),
      ) ||
      ISOLATED_MODE_ASSETS.includes(getAssetIdFromAddress(item.underlyingAsset))
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

  const gSorting = useDataTableUrlSorting("/borrow/dashboard", "supplyGSort")
  const sorting = useDataTableUrlSorting("/borrow/dashboard", "supplySort")

  return (
    <>
      {isMobile ? (
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
          {strategyAssets.length > 0 && (
            <DataTable
              skeletonRowCount={4}
              isLoading={isLoading}
              onRowClick={(row) => navigateToReserve(row.underlyingAsset)}
              fixedLayout
              data={strategyAssets}
              columns={strategyColumns}
              {...gSorting}
            />
          )}
          <DataTable
            skeletonRowCount={4}
            isLoading={isLoading}
            onRowClick={(row) => navigateToReserve(row.underlyingAsset)}
            fixedLayout
            data={baseAssets}
            columns={baseColumns}
            {...sorting}
          />
        </TableContainer>
      )}

      <StrategySupplyModal
        props={modalProps}
        onClose={() => setModalProps(undefined)}
      />
    </>
  )
}
