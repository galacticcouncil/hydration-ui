import { useBorrowAssetsData } from "@galacticcouncil/money-market/hooks"
import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import { Amount, Button, Flex, Icon } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull } from "@/components"
import { useAssets } from "@/providers/assetsProvider"
import { numericallyStr, sortBy } from "@/utils/sort"

type TBorrowAssetsTable = typeof useBorrowAssetsData
type TBorrowAssetsTableData = ReturnType<TBorrowAssetsTable>
type TBorrowAssetsRow = TBorrowAssetsTableData["data"][number]
const columnHelper = createColumnHelper<TBorrowAssetsRow>()

export const useBorrowAssetsTableColumns = () => {
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

    const balanceColumn = columnHelper.accessor("availableBorrowsInUSD", {
      header: t("borrow:available"),
      sortingFn: sortBy({
        select: (row) => row.original.availableBorrowsInUSD,
        compare: numericallyStr,
      }),
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
      cell: () => {
        return (
          <Flex justify="flex-end" align="center" gap={4}>
            <Button
              variant="tertiary"
              size="small"
              onClick={(e) => e.stopPropagation()}
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

    return [assetColumn, balanceColumn, apyColumn, actionsColumn]
  }, [getAsset, t])
}
