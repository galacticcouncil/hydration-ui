import { DashboardReserve } from "@galacticcouncil/money-market/utils"
import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Button,
  Flex,
  Icon,
  Toggle,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull } from "@/components"
import { useAssets } from "@/providers/assetsProvider"
import { numericallyStr, sortBy } from "@/utils/sort"

const columnHelper = createColumnHelper<DashboardReserve>()

export type AssetDetailModal = "deposit" | "withdraw" | "transfer"

export const useSupplyAssetsTableColumns = () => {
  const { t } = useTranslation(["common", "borrow"])
  const { getAsset } = useAssets()

  return useMemo(() => {
    const assetColumn = columnHelper.accessor("symbol", {
      header: t("asset"),
      cell: ({ row }) => {
        const assetId = getAssetIdFromAddress(row.original.underlyingAsset)
        const asset = getAsset(assetId)

        return asset && <AssetLabelFull asset={asset} withName={false} />
      },
    })

    const balanceColumn = columnHelper.accessor("walletBalanceUSD", {
      header: t("balance"),
      sortingFn: sortBy({
        select: (row) => row.original.walletBalanceUSD,
        compare: numericallyStr,
      }),
      cell: ({ row }) => {
        const { walletBalance, walletBalanceUSD } = row.original

        return (
          <Amount
            value={t("number", {
              value: walletBalance,
            })}
            displayValue={t("currency", { value: walletBalanceUSD })}
          />
        )
      },
    })

    const apyColumn = columnHelper.accessor("supplyAPY", {
      header: t("apy"),
      sortingFn: sortBy({
        select: (row) => row.original.supplyAPY,
        compare: numericallyStr,
      }),
      cell: ({ row }) => {
        const { supplyAPY } = row.original

        const percent = Number(supplyAPY) * 100

        const value = t("percent", {
          value: percent,
        })

        return <Amount value={value} />
      },
    })

    const collateralColunn = columnHelper.display({
      header: t("borrow:collateral"),
      meta: {
        sx: {
          textAlign: "center",
        },
      },
      cell: ({ row }) => {
        return (
          <Flex justify="center">
            <Toggle
              checked={row.original.usageAsCollateralEnabledOnUser}
              onClick={(e) => e.stopPropagation()}
              onCheckedChange={() => {}}
            />
          </Flex>
        )
      },
    })

    const actionsColumn = columnHelper.display({
      id: "actions",
      meta: {
        sx: {
          textAlign: "right",
        },
      },
      cell: () => {
        return (
          <Flex justify="flex-end" align="center" gap={4}>
            <Button
              variant="tertiary"
              size="small"
              onClick={(e) => e.stopPropagation()}
            >
              {t("borrow:withdraw")}
            </Button>
            <Icon
              sx={{ flexShrink: 0, mr: -10 }}
              component={ChevronRight}
              color={getToken("icons.onContainer")}
              size={16}
            />
          </Flex>
        )
      },
    })

    return [
      assetColumn,
      balanceColumn,
      apyColumn,
      collateralColunn,
      actionsColumn,
    ]
  }, [getAsset, t])
}
