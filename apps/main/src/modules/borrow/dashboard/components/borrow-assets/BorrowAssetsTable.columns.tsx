import {
  useBorrowAssetsData,
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

type TBorrowAssetsTable = typeof useBorrowAssetsData
type TBorrowAssetsTableData = ReturnType<TBorrowAssetsTable>
type TBorrowAssetsRow = TBorrowAssetsTableData["data"][number]
const columnHelper = createColumnHelper<TBorrowAssetsRow>()

export const useBorrowAssetsTableColumns = () => {
  const { t } = useTranslation(["common", "borrow"])
  const { getAsset } = useAssets()

  const { openBorrow } = useModalContext()

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

    const balanceColumn = columnHelper.accessor("availableBorrowsInUSD", {
      header: t("borrow:available"),
      sortingFn: sortBy({
        select: (row) => row.original.availableBorrowsInUSD,
        compare: numericallyStr,
      }),
      meta: {
        sx: { textAlign: "right" },
      },
      cell: ({ row }) => {
        const { availableBorrows, availableBorrowsInUSD } = row.original

        return (
          <Amount
            value={t("number", {
              value: availableBorrows,
            })}
            displayValue={t("currency", { value: availableBorrowsInUSD })}
          />
        )
      },
    })

    const apyColumn = columnHelper.accessor("variableBorrowRate", {
      header: t("apy"),
      sortingFn: sortBy({
        select: (row) => row.original.variableBorrowRate,
        compare: numericallyStr,
      }),
      meta: {
        sx: {
          textAlign: "center",
        },
      },
      cell: ({ row }) => {
        const { variableBorrowRate } = row.original

        const percent = Number(variableBorrowRate) * 100

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
        const { isFreezed, availableBorrows, underlyingAsset } = row.original
        const isDisabled = isFreezed || Number(availableBorrows) <= 0

        return (
          <Flex justify="flex-end" align="center" gap={4}>
            <Button
              variant="tertiary"
              size="small"
              disabled={isDisabled}
              onClick={(e) => {
                e.stopPropagation()
                openBorrow(underlyingAsset)
              }}
            >
              {t("borrow:borrow")}
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
        const { isFreezed, availableBorrows, underlyingAsset } = row.original
        const isDisabled = isFreezed || Number(availableBorrows) <= 0

        return (
          <Button
            variant="tertiary"
            size="large"
            width="100%"
            disabled={isDisabled}
            onClick={(e) => {
              e.stopPropagation()
              openBorrow(underlyingAsset)
            }}
          >
            {t("borrow:borrow")}
          </Button>
        )
      },
    })

    return isMobile
      ? [assetColumnMobile, balanceColumn, apyColumn, actionsColumnMobile]
      : [assetColumn, balanceColumn, apyColumn, actionsColumn]
  }, [isMobile, getAsset, openBorrow, t])
}
