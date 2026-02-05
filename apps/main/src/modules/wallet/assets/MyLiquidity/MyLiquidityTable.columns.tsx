import {
  Amount,
  TableRowDetailsExpand,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { ColumnDef, createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull, AssetLabelXYK } from "@/components/AssetLabelFull"
import { MyLiquidityTableActions } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.actions"
import { LiquidityPositionByAsset } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityTable.data"
import { useAssets } from "@/providers/assetsProvider"
import { useFormatOmnipoolPositionData } from "@/states/liquidity"
import { naturally, numerically, numericallyStr, sortBy } from "@/utils/sort"

export enum MyLiquidityTableColumnId {
  META = "meta",
  CurrentValue = "currentValue",
  NumberOfPositions = "numberOfPositions",
  Actions = "actions",
}

const columnHelper = createColumnHelper<LiquidityPositionByAsset>()

export const useMyLiquidityColumns = (isEmpty: boolean) => {
  const { isShareToken } = useAssets()
  const { t } = useTranslation(["wallet", "common"])
  const { isMobile } = useBreakpoints()

  const format = useFormatOmnipoolPositionData()

  return useMemo(() => {
    const assetColumn = columnHelper.accessor("meta.symbol", {
      id: MyLiquidityTableColumnId.META,
      header: t("common:asset"),
      sortingFn: sortBy({
        select: (row) => row.original.meta.symbol,
        compare: naturally,
      }),
      cell: ({ row: { original } }) => {
        return isShareToken(original.meta) ? (
          <AssetLabelXYK
            iconIds={original.meta.iconId}
            symbol={original.meta.symbol}
            name={original.meta.name}
          />
        ) : (
          <AssetLabelFull asset={original.meta} />
        )
      },
    })

    const currentValueColumn = columnHelper.accessor("currentTotalDisplay", {
      id: MyLiquidityTableColumnId.CurrentValue,
      header: t("myLiquidity.header.currentValue"),
      sortingFn: sortBy({
        select: (row) => row.original.currentTotalDisplay,
        compare: numericallyStr,
      }),
      cell: ({ row: { original } }) => (
        <Amount
          value={
            isShareToken(original.meta)
              ? t("common:currency", {
                  value: original.currentValueHuman,
                  symbol: "Shares",
                })
              : format(original)
          }
          displayValue={t("common:currency", {
            value: original.currentTotalDisplay,
          })}
        />
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
          ...(isEmpty && { pr: "0 !important" }),
        },
      },
      cell: ({ row: { original } }) => {
        return (
          <MyLiquidityTableActions
            assetId={
              isShareToken(original.meta)
                ? original.meta.poolAddress
                : original.meta.id
            }
          />
        )
      },
    })

    const assetColumnMobile = columnHelper.accessor("meta.symbol", {
      id: MyLiquidityTableColumnId.META,
      header: t("common:asset"),
      sortingFn: sortBy({
        select: (row) => row.original.meta.symbol,
        compare: naturally,
      }),
      cell: ({ row: { original } }) => {
        return isShareToken(original.meta) ? (
          <AssetLabelXYK
            iconIds={original.meta.iconId}
            symbol={original.meta.symbol}
          />
        ) : (
          <AssetLabelFull asset={original.meta} withName={false} />
        )
      },
    })

    const currentValueColumnMobile = columnHelper.accessor(
      "currentTotalDisplay",
      {
        id: MyLiquidityTableColumnId.CurrentValue,
        header: t("myLiquidity.header.currentValue"),
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        sortingFn: sortBy({
          select: (row) => row.original.currentTotalDisplay,
          compare: numericallyStr,
        }),
        cell: ({ row: { original } }) => (
          <TableRowDetailsExpand>
            <Amount
              value={
                isShareToken(original.meta)
                  ? t("common:currency", {
                      value: original.currentValueHuman,
                      symbol: "Shares",
                    })
                  : format(original)
              }
              displayValue={t("common:currency", {
                value: original.currentTotalDisplay,
              })}
            />
          </TableRowDetailsExpand>
        ),
      },
    )

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
  }, [t, isEmpty, isMobile, format, isShareToken])
}
