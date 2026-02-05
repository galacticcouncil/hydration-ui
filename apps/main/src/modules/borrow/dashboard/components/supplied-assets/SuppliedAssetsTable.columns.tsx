import {
  getAssetCapData,
  useModalContext,
  useMoneyMarketData,
  useSuppliedAssetsData,
} from "@galacticcouncil/money-market/hooks"
import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Button,
  Chip,
  Flex,
  Icon,
  Toggle,
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

import { ApyColumn } from "@/modules/borrow/components/ApyColumn"
import { ReserveLabel } from "@/modules/borrow/reserve/components/ReserveLabel"
import { TRemoveMoneyMarketLiquidityProps } from "@/modules/liquidity/components/RemoveLiquidity/RemoveMoneyMarketLiquidity"
import { useAssets } from "@/providers/assetsProvider"
import { numericallyStr, sortBy } from "@/utils/sort"

type TSuppliedAssetsTable = typeof useSuppliedAssetsData
type TSuppliedAssetsTableData = ReturnType<TSuppliedAssetsTable>
type TSuppliedAssetsRow = TSuppliedAssetsTableData["data"][number]
const columnHelper = createColumnHelper<TSuppliedAssetsRow>()

export const useSuppliedAssetsTableColumns = ({
  onRemove,
}: {
  onRemove: (
    props: Omit<TRemoveMoneyMarketLiquidityProps, "onSubmitted">,
  ) => void
}) => {
  const { t } = useTranslation(["common", "borrow"])
  const { isMobile } = useBreakpoints()
  const { getRelatedAToken } = useAssets()
  const { user } = useMoneyMarketData()
  const { openWithdraw, openCollateralChange } = useModalContext()

  return useMemo(() => {
    const assetColumn = columnHelper.accessor("reserve.symbol", {
      header: isMobile ? "" : t("asset"),
      cell: ({ row }) => {
        return (
          <ReserveLabel
            reserve={row.original.reserve}
            size={isMobile ? "large" : "medium"}
          />
        )
      },
    })

    const balanceColumn = columnHelper.accessor("underlyingBalanceUSD", {
      header: t("balance"),
      sortingFn: sortBy({
        select: (row) => row.original.underlyingBalanceUSD,
        compare: numericallyStr,
      }),
      meta: {
        sx: { textAlign: "right" },
      },
      cell: ({ row }) => {
        const { underlyingBalanceUSD, underlyingBalance } = row.original

        return (
          <Amount
            value={t("number", {
              value: underlyingBalance,
            })}
            displayValue={t("currency", {
              value: underlyingBalanceUSD,
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
          px: 0,
          textAlign: "center",
        },
      },
      cell: ({ row }) => {
        const { usageAsCollateralEnabledOnUser, underlyingAsset, reserve } =
          row.original

        const { isPaused, isIsolated } = reserve

        const { debtCeiling } = getAssetCapData(reserve)

        const canBeEnabledAsCollateral =
          !debtCeiling.isMaxed &&
          reserve.reserveLiquidationThreshold !== "0" &&
          ((!reserve.isIsolated && !user.isInIsolationMode) ||
            user.isolatedReserve?.underlyingAsset === reserve.underlyingAsset ||
            (reserve.isIsolated &&
              user.totalCollateralMarketReferenceCurrency === "0"))

        const isChecked =
          usageAsCollateralEnabledOnUser && canBeEnabledAsCollateral

        return (
          <Flex direction="column" justify="center" align="center">
            <Toggle
              checked={isChecked}
              disabled={isPaused || !canBeEnabledAsCollateral}
              onClick={(e) => e.stopPropagation()}
              onCheckedChange={() => openCollateralChange(underlyingAsset)}
            />
            {isIsolated && (
              <Tooltip text={t("borrow:tooltip.isolatedAsset")}>
                <Chip variant="warning" size="small">
                  Isolated
                </Chip>
              </Tooltip>
            )}
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
      cell: ({ row }) => {
        const { reserve, underlyingAsset } = row.original

        const { isActive, isPaused } = reserve

        const isDisabled = !isActive || isPaused

        return (
          <Flex justify="flex-end" align="center" gap="s">
            <Button
              disabled={isDisabled}
              variant="tertiary"
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleWithdrawClick(
                  underlyingAsset,
                  getRelatedAToken,
                  onRemove,
                  openWithdraw,
                )
              }}
            >
              {t("borrow:withdraw")}
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
        const { reserve, underlyingAsset } = row.original

        const { isActive, isPaused } = reserve

        const isDisabled = !isActive || isPaused

        return (
          <Button
            disabled={isDisabled}
            variant="tertiary"
            size="large"
            width="100%"
            onClick={(e) => {
              e.stopPropagation()
              handleWithdrawClick(
                underlyingAsset,
                getRelatedAToken,
                onRemove,
                openWithdraw,
              )
            }}
          >
            {t("borrow:withdraw")}
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
    ]
  }, [
    isMobile,
    openCollateralChange,
    openWithdraw,
    t,
    user.isInIsolationMode,
    user.isolatedReserve?.underlyingAsset,
    user.totalCollateralMarketReferenceCurrency,
    getRelatedAToken,
    onRemove,
  ])
}

const handleWithdrawClick = (
  underlyingAsset: string,
  getRelatedAToken: ReturnType<typeof useAssets>["getRelatedAToken"],
  onRemove: (
    props: Omit<TRemoveMoneyMarketLiquidityProps, "onSubmitted">,
  ) => void,
  openWithdraw: ReturnType<typeof useModalContext>["openWithdraw"],
) => {
  const assetId = getAssetIdFromAddress(underlyingAsset)
  const aTokenId = getRelatedAToken(assetId)?.id

  if (assetId && MONEY_MARKET_STRATEGY_ASSETS.includes(assetId) && aTokenId) {
    onRemove({
      poolId: assetId,
      erc20Id: aTokenId,
      stableswapId: assetId,
    })
  } else {
    openWithdraw(underlyingAsset)
  }
}
