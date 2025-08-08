import {
  useBorrowedAssetsData,
  useModalContext,
} from "@galacticcouncil/money-market/hooks"
import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
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

type TBorrowedAssetsTable = typeof useBorrowedAssetsData
type TBorrowedAssetsTableData = ReturnType<TBorrowedAssetsTable>
type TBorrowedAssetsRow = TBorrowedAssetsTableData["data"][number]
const columnHelper = createColumnHelper<TBorrowedAssetsRow>()

export const useBorrowedAssetsTableColumns = () => {
  const { t } = useTranslation(["common", "borrow"])
  const { getAsset } = useAssets()

  const { openRepay } = useModalContext()

  const { isMobile } = useBreakpoints()

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

    const balanceColumn = columnHelper.accessor("totalBorrowsUSD", {
      header: t("borrow:debt"),
      sortingFn: sortBy({
        select: (row) => row.original.totalBorrowsUSD,
        compare: numericallyStr,
      }),
      meta: {
        sx: { textAlign: "right" },
      },
      cell: ({ row }) => {
        const { totalBorrows, totalBorrowsUSD } = row.original

        return (
          <Amount
            value={t("number", {
              value: totalBorrows,
            })}
            displayValue={t("currency", { value: totalBorrowsUSD })}
          />
        )
      },
    })

    const apyColumn = columnHelper.accessor("borrowAPY", {
      header: t("apy"),
      meta: {
        sx: {
          textAlign: "center",
        },
      },
      cell: ({ row }) => {
        const { borrowAPY } = row.original

        const percent = Number(borrowAPY) * 100

        const value = t("percent", {
          value: percent,
        })

        return <Amount value={value} />
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
        const { reserve, underlyingAsset, borrowRateMode } = row.original

        const isDisabled = !reserve.isActive || reserve.isPaused
        return (
          <Flex justify="flex-end" align="center" gap={4}>
            <Button
              variant="tertiary"
              size="small"
              disabled={isDisabled}
              onClick={(e) => {
                e.stopPropagation()
                openRepay(underlyingAsset, borrowRateMode, reserve.isFrozen)
              }}
            >
              {t("borrow:repay")}
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
        const { reserve, underlyingAsset, borrowRateMode } = row.original

        const isDisabled = !reserve.isActive || reserve.isPaused
        return (
          <Button
            variant="tertiary"
            width="100%"
            size="large"
            disabled={isDisabled}
            onClick={(e) => {
              e.stopPropagation()
              openRepay(underlyingAsset, borrowRateMode, reserve.isFrozen)
            }}
          >
            {t("borrow:repay")}
          </Button>
        )
      },
    })

    return isMobile
      ? [assetColumnMobile, balanceColumn, apyColumn, actionsColumnMobile]
      : [assetColumn, balanceColumn, apyColumn, actionsColumn]
  }, [isMobile, getAsset, openRepay, t])
}
