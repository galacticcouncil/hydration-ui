import { IncentivesButton } from "@galacticcouncil/money-market/components"
import {
  getAssetCapData,
  useModalContext,
} from "@galacticcouncil/money-market/hooks"
import { DashboardReserve } from "@galacticcouncil/money-market/utils"
import { Check, ChevronRight } from "@galacticcouncil/ui/assets/icons"
import { Amount, Button, Flex, Icon } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull } from "@/components/AssetLabelFull"
import { useAssets } from "@/providers/assetsProvider"
import { numericallyStr, sortBy } from "@/utils/sort"

const columnHelper = createColumnHelper<DashboardReserve>()

export type AssetDetailModal = "deposit" | "withdraw" | "transfer"

export const useSupplyAssetsTableColumns = () => {
  const { t } = useTranslation(["common", "borrow"])
  const { getAsset } = useAssets()

  const { openSupply } = useModalContext()

  const { isMobile } = useBreakpoints()

  return useMemo(() => {
    const assetColumn = columnHelper.accessor("symbol", {
      header: t("asset"),
      cell: ({ row }) => {
        const assetId = getAssetIdFromAddress(row.original.underlyingAsset)
        const asset = getAsset(assetId)

        return asset && <AssetLabelFull asset={asset} withName={false} />
      },
    })

    const assetColumnMobile = columnHelper.accessor("symbol", {
      header: "",
      cell: ({ row }) => {
        const assetId = getAssetIdFromAddress(row.original.underlyingAsset)
        const asset = getAsset(assetId)

        return asset && <AssetLabelFull size="large" asset={asset} />
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
      meta: {
        sx: {
          textAlign: "center",
        },
      },
      cell: ({ row }) => {
        const { supplyAPY, aIncentivesData, symbol } = row.original

        const percent = Number(supplyAPY) * 100

        const value = t("percent", {
          value: percent,
        })

        return (
          <>
            <Amount value={value} />
            <IncentivesButton incentives={aIncentivesData} symbol={symbol} />
          </>
        )
      },
    })

    const collateralColunn = columnHelper.display({
      header: t("borrow:canBeCollateral"),
      meta: {
        sx: {
          textAlign: "center",
        },
      },
      cell: ({ row }) => {
        const { isIsolated, usageAsCollateralEnabledOnUser } = row.original
        if (usageAsCollateralEnabledOnUser && !isIsolated) {
          return (
            <Icon
              display="inline-flex"
              color={getToken("colors.successGreen.400")}
              component={Check}
              size={16}
            />
          )
        }
      },
    })

    const actionsColumn = columnHelper.display({
      id: "actions",
      meta: {
        sx: {
          textAlign: "right",
        },
      },
      cell: ({ row }) => {
        const {
          isActive,
          isPaused,
          walletBalance,
          isFreezed,
          underlyingAsset,
        } = row.original

        const { supplyCap } = getAssetCapData(row.original.reserve)
        const isMaxCapReached = supplyCap.isMaxed

        const isDisabled =
          !isActive ||
          isPaused ||
          isFreezed ||
          Number(walletBalance ?? 0) <= 0 ||
          isMaxCapReached

        return (
          <Flex justify="flex-end" align="center" gap={4}>
            <Button
              disabled={isDisabled}
              variant="tertiary"
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                openSupply(underlyingAsset)
              }}
            >
              {t("borrow:supply")}
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

    const actionsColumnMobile = columnHelper.display({
      id: "actions",
      cell: ({ row }) => {
        const {
          isActive,
          isPaused,
          walletBalance,
          isFreezed,
          underlyingAsset,
        } = row.original

        const { supplyCap } = getAssetCapData(row.original.reserve)
        const isMaxCapReached = supplyCap.isMaxed

        const isDisabled =
          !isActive ||
          isPaused ||
          isFreezed ||
          Number(walletBalance ?? 0) <= 0 ||
          isMaxCapReached

        return (
          <Button
            disabled={isDisabled}
            variant="tertiary"
            size="large"
            width="100%"
            onClick={(e) => {
              e.stopPropagation()
              openSupply(underlyingAsset)
            }}
          >
            {t("borrow:supply")}
          </Button>
        )
      },
    })

    return isMobile
      ? [
          assetColumnMobile,
          balanceColumn,
          apyColumn,
          collateralColunn,
          actionsColumnMobile,
        ]
      : [assetColumn, balanceColumn, apyColumn, collateralColunn, actionsColumn]
  }, [isMobile, getAsset, openSupply, t])
}
