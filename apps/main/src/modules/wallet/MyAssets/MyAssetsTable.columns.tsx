import { Ellipsis } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Flex,
  Icon,
  TableRowAction,
  TableRowActionMobile,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import {
  AssetLabelFull,
  AssetLabelFullMobile,
  useDisplayAssetPrice,
} from "@/components"
import { AssetDetailMobileModal } from "@/modules/wallet/MyAssets/AssetDetailMobileModal"
import { AssetDetailStaking } from "@/modules/wallet/MyAssets/AssetDetailStaking"
import { useAssets } from "@/providers/assetsProvider"
import { TAssetStored } from "@/states/assetRegistry"

export type MyAsset = TAssetStored & {
  readonly total: number
  readonly transferable: number
  readonly canStake: boolean
}

const columnHelper = createColumnHelper<MyAsset>()

export const useMyAssetsColumns = () => {
  const { t } = useTranslation(["wallet", "common"])
  const { isMobile } = useBreakpoints()
  const { getAsset } = useAssets()

  return useMemo(() => {
    const assetColumn = columnHelper.accessor("symbol", {
      enableSorting: false,
      header: t("common:asset"),
      cell: ({ row }) => {
        const asset = getAsset(row.original.id)

        return asset && <AssetLabelFull asset={asset} />
      },
    })

    const totalColumn = columnHelper.accessor("total", {
      header: t("myAssets.header.total"),
      cell: function Cell({ row }) {
        const [displayPrice] = useDisplayAssetPrice(
          row.original.id,
          row.original.total,
        )

        return <Amount value={row.original.total} displayValue={displayPrice} />
      },
    })

    const transferableColumn = columnHelper.accessor("transferable", {
      header: t("myAssets.header.transferable"),
      cell: function Cell({ row }) {
        const [displayPrice] = useDisplayAssetPrice(
          row.original.id,
          row.original.transferable,
        )

        return (
          <Amount
            value={row.original.transferable}
            displayValue={displayPrice}
          />
        )
      },
    })

    const stakingColumn = columnHelper.display({
      id: "staking",
      cell: ({ row }) => {
        return <AssetDetailStaking asset={row.original} />
      },
    })

    const actionsColumn = columnHelper.display({
      header: t("common:actions"),
      meta: {
        sx: {
          textAlign: "right",
        },
      },
      cell: () => {
        return (
          <Flex gap={8}>
            <TableRowAction>{t("common:send")}</TableRowAction>
            <TableRowAction>{t("common:trade")}</TableRowAction>
            <TableRowAction>
              <Icon
                component={Ellipsis}
                color={getToken("icons.onContainer")}
                size={12}
              />
            </TableRowAction>
          </Flex>
        )
      },
    })

    const assetColumnMobile = columnHelper.accessor("symbol", {
      enableSorting: false,
      header: t("common:asset"),
      cell: ({ row }) => {
        const asset = getAsset(row.original.id)

        return asset && <AssetLabelFullMobile asset={asset} />
      },
    })

    const totalColumnMobile = columnHelper.accessor("total", {
      header: t("myAssets.header.total"),
      meta: {
        sx: {
          textAlign: "right",
        },
      },
      cell: function Cell({ row }) {
        const [isDetailOpen, setIsDetailOpen] = useState(false)
        const [displayPrice] = useDisplayAssetPrice(
          row.original.id,
          row.original.total,
        )

        return (
          <>
            <TableRowActionMobile onClick={() => setIsDetailOpen(true)}>
              <Amount
                variant="small"
                value={row.original.total}
                displayValue={displayPrice}
              />
            </TableRowActionMobile>
            <AssetDetailMobileModal
              asset={row.original}
              isOpen={isDetailOpen}
              onClose={() => setIsDetailOpen(false)}
            />
          </>
        )
      },
    })

    return isMobile
      ? [assetColumnMobile, totalColumnMobile]
      : [
          assetColumn,
          totalColumn,
          transferableColumn,
          stakingColumn,
          actionsColumn,
        ]
  }, [getAsset, isMobile, t])
}
