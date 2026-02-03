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

import { ApyColumn } from "@/modules/borrow/components/ApyColumn"
import { ReserveLabel } from "@/modules/borrow/reserve/components/ReserveLabel"
import { numericallyStr, sortBy } from "@/utils/sort"

type TBorrowAssetsTable = typeof useBorrowAssetsData
type TBorrowAssetsTableData = ReturnType<TBorrowAssetsTable>
type TBorrowAssetsRow = TBorrowAssetsTableData["data"][number]
const columnHelper = createColumnHelper<TBorrowAssetsRow>()

export const useBorrowAssetsTableColumns = () => {
  const { t } = useTranslation(["common", "borrow"])

  const { openBorrow } = useModalContext()

  const { isMobile } = useBreakpoints()

  return useMemo(() => {
    const assetColumn = columnHelper.accessor("symbol", {
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
            displayValue={t("currency", {
              value: availableBorrowsInUSD,
              maximumFractionDigits: 2,
            })}
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
        const { isFreezed, availableBorrows, underlyingAsset } = row.original
        const isDisabled = isFreezed || Number(availableBorrows) <= 0

        return (
          <Flex justify="flex-end" align="center" gap="s">
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
              size="m"
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

    return [
      assetColumn,
      balanceColumn,
      apyColumn,
      isMobile ? actionsColumnMobile : actionsColumn,
    ]
  }, [isMobile, openBorrow, t])
}
