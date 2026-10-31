import { Button, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLogo } from "@/components/AssetLogo"
import { NoData } from "@/modules/borrow/components/NoData"
import { MultiplyAssetPairConfig } from "@/modules/borrow/multiply/types"
import { useAssets } from "@/providers/assetsProvider"

export type MultiplyPositionRow = {
  id: string
  pair: MultiplyAssetPairConfig
  collateralAmount: string
  debtAmount: string
  effectiveLeverage: number | null
}

const columnHelper = createColumnHelper<MultiplyPositionRow>()

export const useMultiplyPositionsColumns = (
  onManagePosition: (row: MultiplyPositionRow) => void,
) => {
  const { t } = useTranslation(["common", "borrow"])
  const { getAsset } = useAssets()

  return useMemo(
    () => [
      columnHelper.display({
        id: "collateralAsset",
        header: t("borrow:collateralAsset"),
        cell: ({ row }) => {
          const asset = getAsset(row.original.pair.collateralAssetId)
          return (
            <Flex align="center" gap="m">
              <AssetLogo id={asset?.id ?? ""} />
              <Text color={getToken("text.high")} fw={600}>
                {t("currency", {
                  value: row.original.collateralAmount,
                  symbol: asset?.symbol,
                })}
              </Text>
            </Flex>
          )
        },
      }),
      columnHelper.display({
        id: "debtAsset",
        header: t("borrow:debtAsset"),
        cell: ({ row }) => {
          const asset = getAsset(row.original.pair.debtAssetId)
          return (
            <Flex align="center" gap="m">
              <AssetLogo id={asset?.id ?? ""} />
              <Text color={getToken("text.high")} fw={600}>
                {t("currency", {
                  value: row.original.debtAmount,
                  symbol: asset?.symbol,
                })}
              </Text>
            </Flex>
          )
        },
      }),
      columnHelper.display({
        id: "effectiveLeverage",
        header: t("borrow:multiply.positions.effectiveLeverage"),
        meta: {
          sx: { textAlign: "right" },
        },
        cell: ({ row }) => (
          <Text color={getToken("text.high")} fw={600}>
            {row.original.effectiveLeverage ? (
              t("multiplier", { value: row.original.effectiveLeverage })
            ) : (
              <NoData />
            )}
          </Text>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "",

        cell: ({ row }) => (
          <Button
            ml="auto"
            variant="tertiary"
            size="small"
            onClick={(e) => {
              e.stopPropagation()
              onManagePosition(row.original)
            }}
          >
            {t("borrow:multiply.positions.manage")}
          </Button>
        ),
      }),
    ],
    [getAsset, onManagePosition, t],
  )
}
