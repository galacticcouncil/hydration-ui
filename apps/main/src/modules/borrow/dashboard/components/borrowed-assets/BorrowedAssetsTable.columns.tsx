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

import { ApyColumn } from "@/modules/borrow/components/ApyColumn"
import { ReserveLabel } from "@/modules/borrow/reserve/components/ReserveLabel"
import { numericallyStr, sortBy } from "@/utils/sort"

type TBorrowedAssetsTable = typeof useBorrowedAssetsData
type TBorrowedAssetsTableData = ReturnType<TBorrowedAssetsTable>
type TBorrowedAssetsRow = TBorrowedAssetsTableData["data"][number]
const columnHelper = createColumnHelper<TBorrowedAssetsRow>()

export const useBorrowedAssetsTableColumns = () => {
  const { t } = useTranslation(["common", "borrow"])

  const { openRepay } = useModalContext()

  const { isMobile } = useBreakpoints()

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
            displayValue={t("currency", {
              value: totalBorrowsUSD,
              maximumFractionDigits: 2,
            })}
          />
        )
      },
    })

    const apyColumn = columnHelper.accessor("borrowAPY", {
      header: t("apy"),
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
            reserve={row.original.reserve}
          />
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

    return [
      assetColumn,
      balanceColumn,
      apyColumn,
      isMobile ? actionsColumnMobile : actionsColumn,
    ]
  }, [isMobile, openRepay, t])
}
