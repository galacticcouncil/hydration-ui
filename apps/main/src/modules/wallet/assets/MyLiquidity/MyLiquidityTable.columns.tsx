import {
  Modal,
  TableRowAction,
  TableRowActionMobile,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull } from "@/components"
import { LiquidityDetailMobileModal } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailMobileModal"
import { MyLiquidityCurrentValue } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityCurrentValue"
import { LiquidityPositionByAsset } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"
import { naturally, numerically, numericallyStr, sortBy } from "@/utils/sort"

export enum MyLiquidityTableColumnId {
  Asset = "asset",
  CurrentValue = "currentValue",
  NumberOfPositions = "numberOfPositions",
  Actions = "actions",
}

const columnHelper = createColumnHelper<LiquidityPositionByAsset>()

export const useMyLiquidityColumns = () => {
  const { t } = useTranslation(["wallet", "common"])
  const { isMobile } = useBreakpoints()

  return useMemo(() => {
    const assetColumn = columnHelper.accessor("asset.symbol", {
      id: MyLiquidityTableColumnId.Asset,
      header: t("common:asset"),
      sortingFn: sortBy({
        select: (row) => row.original.asset.symbol,
        compare: naturally,
      }),
      cell: ({ row }) => {
        return <AssetLabelFull asset={row.original.asset} />
      },
    })

    const currentValueColumn = columnHelper.accessor("currentValue", {
      id: MyLiquidityTableColumnId.CurrentValue,
      header: t("myLiquidity.header.currentValue"),
      sortingFn: sortBy({
        select: (row) => row.original.currentValueDisplay,
        compare: numericallyStr,
      }),
      cell: ({ row }) => (
        <>
          <MyLiquidityCurrentValue
            asset={row.original.asset}
            currentValue={row.original.currentValue}
          />
        </>
      ),
    })

    const positionsColumn = columnHelper.accessor("positions.length", {
      id: MyLiquidityTableColumnId.NumberOfPositions,
      header: t("myLiquidity.header.numberOfPositions"),
      meta: {
        sx: {
          textAlign: "center",
        },
      },
      sortingFn: sortBy({
        select: (row) => row.original.positions.length,
        compare: numerically,
      }),
      cell: ({ row }) => {
        return (
          <Text fw={500} fs="p5" lh={1.2} color={getToken("text.high")}>
            {row.original.positions.length}
          </Text>
        )
      },
    })

    const actionsColumn = columnHelper.display({
      id: MyLiquidityTableColumnId.Actions,
      header: t("common:actions"),
      meta: {
        sx: {
          textAlign: "right",
        },
      },
      cell: ({ row }) => {
        return (
          <TableRowAction asChild>
            <Link to="/liquidity/$id" params={{ id: row.original.asset.id }}>
              {t("myLiquidity.actions.poolDetails")}
            </Link>
          </TableRowAction>
        )
      },
    })

    const assetColumnMobile = columnHelper.accessor("asset.symbol", {
      id: MyLiquidityTableColumnId.Asset,
      header: t("common:asset"),
      sortingFn: sortBy({
        select: (row) => row.original.asset.symbol,
        compare: naturally,
      }),
      cell: ({ row }) => {
        return <AssetLabelFull asset={row.original.asset} withName={false} />
      },
    })

    const currentValueColumnMobile = columnHelper.accessor("currentValue", {
      id: MyLiquidityTableColumnId.CurrentValue,
      header: t("myLiquidity.header.currentValue"),
      meta: {
        sx: {
          textAlign: "right",
        },
      },
      sortingFn: sortBy({
        select: (row) => row.original.currentValueDisplay,
        compare: numericallyStr,
      }),
      cell: function Cell({ row }) {
        const [isDetailOpen, setIsDetailOpen] = useState(false)

        return (
          <>
            <TableRowActionMobile onClick={() => setIsDetailOpen(true)}>
              <MyLiquidityCurrentValue
                asset={row.original.asset}
                currentValue={row.original.currentValue}
              />
            </TableRowActionMobile>
            <Modal open={isDetailOpen} onOpenChange={setIsDetailOpen}>
              <LiquidityDetailMobileModal
                asset={row.original.asset}
                currentValue={row.original.currentValue}
                positions={row.original.positions}
              />
            </Modal>
          </>
        )
      },
    })

    return isMobile
      ? ([
          assetColumnMobile,
          positionsColumn,
          currentValueColumnMobile,
        ] as ColumnDef<LiquidityPositionByAsset>[])
      : ([
          assetColumn,
          currentValueColumn,
          positionsColumn,
          actionsColumn,
        ] as ColumnDef<LiquidityPositionByAsset>[])
  }, [t, isMobile])
}
