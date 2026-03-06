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
import {
  Amount,
  Button,
  Chip,
  Flex,
  Icon,
  Tooltip,
} from "@galacticcouncil/ui/components"
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
import { AddStablepoolLiquidityProps } from "@/modules/liquidity/components/AddStablepoolLiquidity/AddStablepoolLiquidity"
import { useAssets } from "@/providers/assetsProvider"
import { numericallyStr, sortBy } from "@/utils/sort"

const columnHelper = createColumnHelper<DashboardReserve>()

export type AssetDetailModal = "deposit" | "withdraw" | "transfer"
type AssetType = "base" | "strategy"

export const useSupplyAssetsTableColumns = (
  type: AssetType,
  onSupplyClick?: (
    props: Omit<AddStablepoolLiquidityProps, "onSubmitted"> & {
      isIsolated?: boolean
    },
  ) => void,
) => {
  const { t } = useTranslation(["common", "borrow"])
  const { getAsset, getRelatedAToken } = useAssets()

  const { openSupply } = useModalContext()

  const { isMobile } = useBreakpoints()

  const isBaseAssetType = type === "base"

  return useMemo(() => {
    const assetColumn = columnHelper.accessor("symbol", {
      header: isMobile ? "" : t("asset"),
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

    const balancePlaceholderColumn = columnHelper.display({
      id: "balancePlaceholder",
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
      },

      cell: ({ row }) => {
        if (!isBaseAssetType) return null
        const { walletBalance, walletBalanceUSD } = row.original

        return (
          <Amount
            value={t("number", {
              value: walletBalance,
            })}
            displayValue={t("currency", {
              value: walletBalanceUSD,
              maximumFractionDigits: 2,
            })}
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
        if (!usageAsCollateralEnabledOnUser) return <NoData size="m" />
        if (usageAsCollateralEnabledOnUser && !isIsolated) {
          return (
            <Icon
              display="inline-flex"
              color={getToken("accents.success.emphasis")}
              component={Check}
              size="m"
            />
          )
        }
        if (isIsolated) {
          return (
            <Tooltip text={t("borrow:tooltip.isolatedAsset")}>
              <Chip variant="warning" size="small">
                {t("borrow:isolated")}
              </Chip>
            </Tooltip>
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
        const { underlyingAsset, isIsolated } = row.original
        const isDisabled = !isIsolated && getIsSupplyDisabled(row.original)

        return (
          <Flex justify="flex-end" align="center" gap="s">
            <Button
              disabled={isDisabled}
              variant="tertiary"
              size="small"
              onClick={(e) => {
                e.stopPropagation()

                const assetId = getAssetIdFromAddress(underlyingAsset)
                const aTokenId = getRelatedAToken(assetId)?.id

                if (
                  assetId &&
                  (MONEY_MARKET_STRATEGY_ASSETS.includes(assetId) ||
                    isIsolated) &&
                  aTokenId &&
                  onSupplyClick
                ) {
                  onSupplyClick({
                    id: assetId,
                    erc20Id: aTokenId,
                    stableswapId: assetId,
                    isIsolated,
                  })
                } else {
                  openSupply(underlyingAsset)
                }
              }}
            >
              {t("borrow:supply")}
            </Button>
            <Icon
              sx={{ flexShrink: 0, mr: -10 }}
              component={ChevronRight}
              color={getToken("icons.onContainer")}
              size="m"
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

              const assetId = getAssetIdFromAddress(underlyingAsset)
              const aTokenId = getRelatedAToken(assetId)?.id

              if (
                assetId &&
                MONEY_MARKET_STRATEGY_ASSETS.includes(assetId) &&
                aTokenId &&
                onSupplyClick
              ) {
                onSupplyClick({
                  id: assetId,
                  erc20Id: aTokenId,
                  stableswapId: assetId,
                })
              } else {
                openSupply(underlyingAsset)
              }
            }}
          >
            {t("borrow:supply")}
          </Button>
        )
      },
    })

    return [
      assetColumn,
      isBaseAssetType ? balanceColumn : balancePlaceholderColumn,
      apyColumn,
      collateralColunn,
      isMobile ? actionsColumnMobile : actionsColumn,
    ].filter(Boolean)
  }, [
    isMobile,
    getAsset,
    openSupply,
    t,
    isBaseAssetType,
    getRelatedAToken,
    onSupplyClick,
  ])
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
