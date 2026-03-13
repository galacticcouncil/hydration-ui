import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import {
  AssetLabel,
  Button,
  Flex,
  Icon,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFullContainer } from "@/components/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"
import { MultiplyPair } from "@/modules/borrow/multiply/hooks/useMultiplyPairs"
import {
  calculateMaxLeverage,
  getMaxReservePairLeverage,
} from "@/modules/borrow/multiply/utils/leverage"
import { ReserveLabel } from "@/modules/borrow/reserve/components/ReserveLabel"
import { useAssets } from "@/providers/assetsProvider"

const columnHelper = createColumnHelper<MultiplyPair>()

export const useMultiplyPairsTableColumns = () => {
  const { t } = useTranslation(["common", "borrow"])
  const { getAsset } = useAssets()

  return useMemo(() => {
    const collateralColumn = columnHelper.display({
      id: "collateralAsset",
      header: t("borrow:multiply.detail.collateralAsset"),
      cell: ({ row }) => {
        return <ReserveLabel reserve={row.original.collateralReserve} />
      },
    })

    const debtColumn = columnHelper.display({
      id: "debtAsset",
      header: t("borrow:multiply.detail.debtAsset"),
      cell: ({ row }) => {
        const debtAsset = getAsset(row.original.config.debtAssetId)
        if (!debtAsset) return null

        return (
          <AssetLabelFullContainer>
            <AssetLogo id={debtAsset.id} />
            <AssetLabel symbol={debtAsset.symbol} />
          </AssetLabelFullContainer>
        )
      },
    })

    const apyColumn = columnHelper.display({
      id: "apy",
      header: t("common:apy"),
      meta: {
        sx: { textAlign: "right" },
      },
      cell: ({ row }) => {
        const baseSupplyApy =
          Number(row.original.collateralReserve.supplyAPY) * 100
        const supplyApy =
          row.original.apyData?.underlyingSupplyApy || baseSupplyApy

        return (
          <Text fs="p4" fw={500} color={getToken("accents.success.emphasis")}>
            {t("common:percent", { value: supplyApy })}
          </Text>
        )
      },
    })

    const leverageColumn = columnHelper.display({
      id: "maxLeverage",
      header: t("borrow:multiply.detail.maxLeverage"),
      meta: {
        sx: { textAlign: "right" },
      },
      cell: ({ row }) => {
        const collateral = row.original.collateralReserve
        const debt = row.original.debtReserve
        const maxLeverage = debt
          ? getMaxReservePairLeverage(collateral, debt)
          : calculateMaxLeverage(
              Number(collateral.formattedBaseLTVasCollateral),
            )
        return (
          <Text fs="p4" fw={500}>
            {t("common:multiplier", { value: maxLeverage })}
          </Text>
        )
      },
    })

    const liquidityColumn = columnHelper.display({
      id: "liquidity",
      header: t("borrow:multiply.strategy.liquidityAvailable"),
      meta: {
        sx: { textAlign: "right" },
      },
      cell: ({ row }) => {
        const { availableLiquidityUSD } = row.original.collateralReserve
        const liquidity = availableLiquidityUSD
          ? t("common:currency.compact", {
              value: Number(availableLiquidityUSD),
            })
          : "\u2014"

        return (
          <Text fs="p4" fw={500}>
            {liquidity}
          </Text>
        )
      },
    })

    const actionsColumn = columnHelper.display({
      id: "actions",
      meta: {
        sx: { textAlign: "right" },
      },
      cell: () => (
        <Flex justify="flex-end" align="center" gap="s">
          <Button variant="tertiary" size="small">
            {t("common:details")}
          </Button>
          <Icon
            sx={{ flexShrink: 0, mr: -10 }}
            component={ChevronRight}
            color={getToken("icons.onContainer")}
            size="m"
          />
        </Flex>
      ),
    })

    return [
      collateralColumn,
      debtColumn,
      apyColumn,
      leverageColumn,
      liquidityColumn,
      actionsColumn,
    ]
  }, [getAsset, t])
}
