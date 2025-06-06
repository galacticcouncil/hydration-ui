import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import { Amount, Icon } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull } from "@/components/AssetLabelFull"
import { useAssets } from "@/providers/assetsProvider"
import { numericallyStr, sortBy } from "@/utils/sort"

const { accessor, display } = createColumnHelper<ComputedReserveData>()

export const useMarketAssetsTableColumns = () => {
  const { t } = useTranslation(["common", "borrow"])
  const { getAsset } = useAssets()

  return useMemo(
    () => [
      accessor("symbol", {
        header: t("asset"),
        cell: ({ row }) => {
          const assetId = getAssetIdFromAddress(row.original.underlyingAsset)
          const asset = getAsset(assetId)

          return asset && <AssetLabelFull asset={asset} withName={false} />
        },
      }),
      accessor("totalLiquidityUSD", {
        header: t("borrow:market.table.totalSupplied"),
        sortingFn: sortBy({
          select: (row) => row.original.totalLiquidityUSD,
          compare: numericallyStr,
        }),
        cell: ({ row }) => {
          const { totalLiquidityUSD, totalLiquidity } = row.original

          return (
            <Amount
              value={t("number", {
                value: totalLiquidity,
              })}
              displayValue={t("currency", { value: totalLiquidityUSD })}
            />
          )
        },
      }),
      accessor("supplyAPY", {
        header: t("apy"),
        cell: ({ row }) => {
          const { supplyAPY } = row.original

          const percent = Number(supplyAPY) * 100

          const value = t("percent", {
            value: percent,
          })

          return <Amount value={value} />
        },
      }),
      accessor("totalDebtUSD", {
        header: t("borrow:market.table.totalBorrowed"),
        sortingFn: sortBy({
          select: (row) => row.original.totalDebtUSD,
          compare: numericallyStr,
        }),
        cell: ({ row }) => {
          const { totalDebtUSD, totalDebt, borrowingEnabled } = row.original

          if (!borrowingEnabled || totalDebt === "0") {
            return <>&mdash;</>
          }

          return (
            <Amount
              value={t("number", {
                value: totalDebt,
              })}
              displayValue={t("currency", { value: totalDebtUSD })}
            />
          )
        },
      }),
      accessor("variableBorrowAPY", {
        header: t("borrow:market.table.borrowApyVariable"),
        cell: ({ row }) => {
          const { variableBorrowAPY } = row.original

          const percent = Number(variableBorrowAPY) * 100

          const value = t("percent", {
            value: percent,
          })

          return <Amount value={value} />
        },
      }),
      display({
        id: "actions",
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        cell: () => (
          <Icon
            display="inline-flex"
            component={ChevronRight}
            color={getToken("icons.onContainer")}
            size={16}
          />
        ),
      }),
    ],
    [getAsset, t],
  )
}
