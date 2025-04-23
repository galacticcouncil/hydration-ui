import {
  Modal,
  TableRowAction,
  TableRowActionMobile,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull } from "@/components"
import { LiquidityDetailMobileModal } from "@/modules/wallet/assets/MyLiquidity/LiquidityDetailMobileModal"
import { MyLiquidityCurrentValue } from "@/modules/wallet/assets/MyLiquidity/MyLiquidityCurrentValue"
import { useAssets } from "@/providers/assetsProvider"

export type WalletLiquidityPosition = {
  readonly name: string
  readonly initialValue: number
  readonly currentValue: number
  readonly rewards: number
}

export type WalletLiquidityCurrentValue = {
  readonly asset1Id: string
  readonly asset1Amount: string
  readonly asset2Id: string
  readonly asset2Amount: string
  readonly balance: number
}

export type WalletLiquidityRow = {
  readonly assetId: string
  readonly positions: ReadonlyArray<WalletLiquidityPosition>
  readonly currentValue: WalletLiquidityCurrentValue
}

const columnHelper = createColumnHelper<WalletLiquidityRow>()

export const useMyLiquidityColumns = () => {
  const { t } = useTranslation(["wallet", "common"])
  const { isMobile } = useBreakpoints()

  const { getAsset } = useAssets()

  return useMemo(() => {
    const assetColumn = columnHelper.accessor("assetId", {
      enableSorting: false,
      filterFn: (row, _, filterValue) => {
        const asset = getAsset(row.original.assetId)

        return !!asset?.symbol.toLowerCase().includes(filterValue.toLowerCase())
      },
      header: t("common:asset"),
      cell: ({ row }) => {
        const asset = getAsset(row.original.assetId)

        return asset && <AssetLabelFull asset={asset} />
      },
    })

    const currentValueColumn = columnHelper.accessor("currentValue", {
      header: t("myLiquidity.header.currentValue"),
      cell: ({ row }) => (
        <MyLiquidityCurrentValue currentValue={row.original.currentValue} />
      ),
    })

    const positionsColumn = columnHelper.display({
      header: t("myLiquidity.header.numberOfPositions"),
      cell: ({ row }) => {
        return <Text>{row.original.positions.length}</Text>
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
          <TableRowAction>
            {t("myLiquidity.actions.poolDetails")}
          </TableRowAction>
        )
      },
    })

    const assetColumnMobile = columnHelper.accessor("assetId", {
      enableSorting: false,
      filterFn: (row, _, filterValue) => {
        const asset = getAsset(row.original.assetId)

        return !!asset?.symbol.toLowerCase().includes(filterValue.toLowerCase())
      },
      header: t("common:asset"),
      cell: ({ row }) => {
        const asset = getAsset(row.original.assetId)

        return asset && <AssetLabelFull asset={asset} withName={false} />
      },
    })

    const currentValueColumnMobile = columnHelper.accessor("currentValue", {
      header: t("myLiquidity.header.currentValue"),
      meta: {
        sx: {
          textAlign: "right",
        },
      },
      cell: function Cell({ row }) {
        const [isDetailOpen, setIsDetailOpen] = useState(false)

        return (
          <>
            <TableRowActionMobile onClick={() => setIsDetailOpen(true)}>
              <MyLiquidityCurrentValue
                currentValue={row.original.currentValue}
              />
            </TableRowActionMobile>
            <Modal open={isDetailOpen} onOpenChange={setIsDetailOpen}>
              <LiquidityDetailMobileModal
                assetId={row.original.assetId}
                currentValue={row.original.currentValue}
                positions={row.original.positions}
              />
            </Modal>
          </>
        )
      },
    })

    return isMobile
      ? [assetColumnMobile, positionsColumn, currentValueColumnMobile]
      : [assetColumn, currentValueColumn, positionsColumn, actionsColumn]
  }, [getAsset, t, isMobile])
}
