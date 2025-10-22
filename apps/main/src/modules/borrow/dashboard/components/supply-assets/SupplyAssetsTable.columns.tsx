import {
  getAssetCapData,
  useModalContext,
} from "@galacticcouncil/money-market/hooks"
import {
  DashboardReserve,
  GHO_ASSET_ID,
  isGho,
} from "@galacticcouncil/money-market/utils"
import { Check, ChevronRight } from "@galacticcouncil/ui/assets/icons"
import { Amount, Button, Flex, Icon } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  getAssetIdFromAddress,
  MONEY_MARKET_STRATEGY_ASSETS,
} from "@galacticcouncil/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull } from "@/components/AssetLabelFull"
import { ApyColumn } from "@/modules/borrow/components/ApyColumn"
import { NoData } from "@/modules/borrow/components/NoData"
import { ReserveLabel } from "@/modules/borrow/reserve/components/ReserveLabel"
import { useAssets } from "@/providers/assetsProvider"
import { numericallyStr, sortBy } from "@/utils/sort"

const columnHelper = createColumnHelper<DashboardReserve>()

export type AssetDetailModal = "deposit" | "withdraw" | "transfer"
type AssetType = "base" | "strategy"

export const useSupplyAssetsTableColumns = (type: AssetType) => {
  const { t } = useTranslation(["common", "borrow"])
  const { getAsset } = useAssets()

  const { openSupply } = useModalContext()

  const { isMobile } = useBreakpoints()

  const isBaseAssetType = type === "base"

  return useMemo(() => {
    const assetColumn = columnHelper.accessor("symbol", {
      header: isMobile ? "" : t("asset"),
      size: isBaseAssetType ? undefined : 210,
      cell: ({ row }) => {
        if (isBaseAssetType) {
          const assetId = isGho(row.original)
            ? GHO_ASSET_ID
            : getAssetIdFromAddress(row.original.underlyingAsset)
          const asset = getAsset(assetId)

          return (
            asset && (
              <AssetLabelFull
                size={isMobile ? "large" : "medium"}
                asset={asset}
                withName={false}
              />
            )
          )
        }

        return (
          <ReserveLabel
            size={isMobile ? "large" : "medium"}
            reserve={row.original.reserve}
          />
        )
      },
    })

    const balanceColumn = columnHelper.accessor("walletBalanceUSD", {
      header: t("balance"),
      sortingFn: sortBy({
        select: (row) => row.original.walletBalanceUSD,
        compare: numericallyStr,
      }),
      meta: {
        sx: {
          textAlign: "right",
        },
        visibility: isBaseAssetType ? undefined : [],
      },

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
          textAlign: "right",
        },
      },
      cell: ({ row }) => {
        return (
          <ApyColumn
            type="supply"
            assetId={getAssetIdFromAddress(row.original.underlyingAsset)}
            reserve={row.original.reserve}
          />
        )
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
        const { isIsolated, usageAsCollateralEnabledOnUser } = row.original
        const { debtCeiling } = getAssetCapData(row.original.reserve)
        if (debtCeiling.isMaxed) return
        if (!usageAsCollateralEnabledOnUser) return <NoData size={16} />
        if (usageAsCollateralEnabledOnUser && !isIsolated) {
          return (
            <Icon
              display="inline-flex"
              color={getToken("accents.success.emphasis")}
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
        const { underlyingAsset } = row.original
        const isDisabled = getIsSupplyDisabled(row.original)

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
        const { underlyingAsset } = row.original
        const isDisabled = getIsSupplyDisabled(row.original)

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

    return [
      assetColumn,
      balanceColumn,
      apyColumn,
      collateralColunn,
      isMobile ? actionsColumnMobile : actionsColumn,
    ].filter(Boolean)
  }, [isMobile, getAsset, openSupply, t, isBaseAssetType])
}

const getIsSupplyDisabled = (reserve: DashboardReserve) => {
  const { isActive, isPaused, walletBalance, isFreezed } = reserve

  const { supplyCap } = getAssetCapData(reserve)
  const isMaxCapReached = supplyCap.isMaxed

  const isWalletBalanceRequired = !MONEY_MARKET_STRATEGY_ASSETS.includes(
    getAssetIdFromAddress(reserve.underlyingAsset),
  )

  const hasNoBalance = isWalletBalanceRequired
    ? Number(walletBalance ?? 0) <= 0
    : false

  const isDisabled =
    !isActive || isPaused || isFreezed || isMaxCapReached || hasNoBalance

  return isDisabled
}
