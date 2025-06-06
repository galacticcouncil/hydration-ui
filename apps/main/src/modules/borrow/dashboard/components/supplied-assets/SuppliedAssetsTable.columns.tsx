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
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull } from "@/components/AssetLabelFull"
import { useAssets } from "@/providers/assetsProvider"
import { numericallyStr, sortBy } from "@/utils/sort"

type TSuppliedAssetsTable = typeof useSuppliedAssetsData
type TSuppliedAssetsTableData = ReturnType<TSuppliedAssetsTable>
type TSuppliedAssetsRow = TSuppliedAssetsTableData["data"][number]
const columnHelper = createColumnHelper<TSuppliedAssetsRow>()

export const useSuppliedAssetsTableColumns = () => {
  const { t } = useTranslation(["common", "borrow"])
  const { getAsset } = useAssets()
  const { isMobile } = useBreakpoints()
  const { user } = useMoneyMarketData()
  const { openWithdraw, openCollateralChange } = useModalContext()

  return useMemo(() => {
    const assetColumn = columnHelper.accessor("reserve.symbol", {
      header: t("asset"),
      cell: ({ row }) => {
        const assetId = getAssetIdFromAddress(row.original.underlyingAsset)
        const asset = getAsset(assetId)

        return asset && <AssetLabelFull asset={asset} withName={false} />
      },
    })

    const assetColumnMobile = columnHelper.accessor("reserve.symbol", {
      header: "",
      cell: ({ row }) => {
        const assetId = getAssetIdFromAddress(row.original.underlyingAsset)
        const asset = getAsset(assetId)

        return asset && <AssetLabelFull size="large" asset={asset} />
      },
    })

    const balanceColumn = columnHelper.accessor("underlyingBalanceUSD", {
      header: t("balance"),
      sortingFn: sortBy({
        select: (row) => row.original.underlyingBalanceUSD,
        compare: numericallyStr,
      }),
      cell: ({ row }) => {
        const { underlyingBalanceUSD, underlyingBalance } = row.original

        return (
          <Amount
            value={t("number", {
              value: underlyingBalance,
            })}
            displayValue={t("currency", { value: underlyingBalanceUSD })}
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
          <Flex justify="flex-end" align="center" gap={4}>
            <Button
              disabled={isDisabled}
              variant="tertiary"
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                openWithdraw(underlyingAsset)
              }}
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
              openWithdraw(underlyingAsset)
            }}
          >
            {t("borrow:withdraw")}
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
  }, [isMobile, getAsset, openCollateralChange, openWithdraw, t, user])
}
