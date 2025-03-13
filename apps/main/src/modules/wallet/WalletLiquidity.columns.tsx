import { Button, Text } from "@galacticcouncil/ui/components"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull } from "@/components"
import { PairAmountDisplay } from "@/components/PairAmountDisplay/PairAmountDisplay"
import { useAssets } from "@/providers/assetsProvider"

export type WalletLiquidityRow = {
  id: string
  numberOfPositions: number
  currentValue: {
    balance: number
    asset1Id: string
    asset1Amount: string
    asset2Id: string
    asset2Amount: string
  }
}

const columnHelper = createColumnHelper<WalletLiquidityRow>()

export const useWalletLiquidityColumns = () => {
  const { getAsset } = useAssets()
  const { t } = useTranslation(["wallet", "common"])

  return useMemo(() => {
    return [
      columnHelper.display({
        header: t("common:asset"),
        cell: ({ row }) => {
          const asset = getAsset(row.original.id)

          return asset && <AssetLabelFull asset={asset} />
        },
      }),
      columnHelper.display({
        header: t("liquidity.table.header.currentValue"),
        cell: ({ row }) => {
          return (
            <PairAmountDisplay
              balance={row.original.currentValue.balance}
              asset1Amount={row.original.currentValue.asset1Amount}
              asset1Id={row.original.currentValue.asset1Id}
              asset2Amount={row.original.currentValue.asset2Amount}
              asset2Id={row.original.currentValue.asset2Id}
            />
          )
        },
      }),
      columnHelper.display({
        header: t("liquidity.table.header.numberOfPositions"),
        cell: ({ row }) => {
          return <Text>{row.original.numberOfPositions}</Text>
        },
      }),
      columnHelper.display({
        header: t("common:actions"),
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        cell: () => {
          return (
            <Button type="button" variant="tertiary" outline>
              {t("liquidity.table.header.actions.poolDetails")}
            </Button>
          )
        },
      }),
    ]
  }, [getAsset, t])
}
