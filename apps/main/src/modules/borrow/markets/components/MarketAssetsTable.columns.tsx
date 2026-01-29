import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { isGho } from "@galacticcouncil/money-market/utils"
import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import { Amount, Icon } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { ApyColumn } from "@/modules/borrow/components/ApyColumn"
import { NoData } from "@/modules/borrow/components/NoData"
import { ReserveLabel } from "@/modules/borrow/reserve/components/ReserveLabel"
import { numericallyStr, sortBy } from "@/utils/sort"

const { accessor, display } = createColumnHelper<ComputedReserveData>()

export const useMarketAssetsTableColumns = () => {
  const { t } = useTranslation(["common", "borrow"])

  return useMemo(
    () => [
      accessor("symbol", {
        header: t("asset"),
        cell: ({ row }) => {
          return <ReserveLabel reserve={row.original} />
        },
      }),
      accessor("totalLiquidityUSD", {
        header: t("borrow:market.table.totalSupplied"),
        sortingFn: sortBy({
          select: (row) => row.original.totalLiquidityUSD,
          compare: numericallyStr,
        }),
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        cell: ({ row }) => {
          const { totalLiquidityUSD, totalLiquidity } = row.original
          if (isGho(row.original)) return <NoData />

          return (
            <Amount
              value={t("number.compact", {
                value: totalLiquidity,
              })}
              displayValue={t("currency.compact", { value: totalLiquidityUSD })}
            />
          )
        },
      }),
      accessor("supplyAPY", {
        header: t("apy"),
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        cell: ({ row }) => {
          return (
            <ApyColumn
              type="supply"
              assetId={getAssetIdFromAddress(row.original.underlyingAsset)}
              reserve={row.original}
            />
          )
        },
      }),
      accessor("totalDebtUSD", {
        header: t("borrow:market.table.totalBorrowed"),
        sortingFn: sortBy({
          select: (row) => row.original.totalDebtUSD,
          compare: numericallyStr,
        }),
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        cell: ({ row }) => {
          const { totalDebtUSD, totalDebt, borrowingEnabled } = row.original

          if (!borrowingEnabled || totalDebt === "0") {
            return <NoData />
          }

          return (
            <Amount
              value={t("number.compact", {
                value: totalDebt,
              })}
              displayValue={t("currency.compact", { value: totalDebtUSD })}
            />
          )
        },
      }),
      accessor("variableBorrowAPY", {
        header: t("borrow:market.table.borrowApyVariable"),
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        cell: ({ row }) => {
          return (
            <ApyColumn
              type="borrow"
              assetId={getAssetIdFromAddress(row.original.underlyingAsset)}
              reserve={row.original}
            />
          )
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
            size="m"
          />
        ),
      }),
    ],
    [t],
  )
}
