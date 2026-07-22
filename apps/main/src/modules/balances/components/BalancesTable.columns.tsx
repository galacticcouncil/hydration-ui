import { Amount, Flex, Text } from "@galacticcouncil/ui/components"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { resolveHydrationRegistryAssetId } from "@/modules/balances/api/xcBalanceUtils"
import { BalancesTableRow } from "@/modules/balances/components/BalancesTable.data"
import { numericallyStr, sortBy } from "@/utils/sort"

const columnHelper = createColumnHelper<BalancesTableRow>()

export const useBalancesTableColumns = (isHydration: boolean) => {
  const { t } = useTranslation("common")

  return useMemo(() => {
    const asset = columnHelper.accessor("symbol", {
      header: "Asset",
      enableSorting: false,
      cell: ({ row }) =>
        isHydration ? (
          <Flex align="center" gap="base">
            <AssetLogo
              id={resolveHydrationRegistryAssetId(row.original.assetId)}
              size="medium"
            />
            <Text fw={600}>{row.original.symbol}</Text>
          </Flex>
        ) : (
          <Text fw={600}>{row.original.symbol}</Text>
        ),
    })

    const balance = columnHelper.accessor("balanceHuman", {
      id: "balance",
      header: "Balance",
      sortingFn: sortBy({
        select: (row) =>
          isHydration ? row.original.balanceUsd : row.original.balanceHuman,
        compare: numericallyStr,
      }),
      meta: {
        sx: {
          textAlign: "right",
        },
      },
      cell: ({ row }) => (
        <Amount
          value={t("number", { value: row.original.balanceHuman })}
          displayValue={
            row.original.balanceUsdDisplay
              ? t("currency", {
                  value: row.original.balanceUsdDisplay,
                  maximumFractionDigits: 2,
                })
              : undefined
          }
        />
      ),
    })

    return [asset, balance]
  }, [isHydration, t])
}
