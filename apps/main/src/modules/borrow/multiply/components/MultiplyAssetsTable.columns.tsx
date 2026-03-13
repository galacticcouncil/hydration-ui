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
import { MultiplyReserveRow } from "@/modules/borrow/multiply/hooks/useMultiplyReserves"
import { getMaxReserveLeverage } from "@/modules/borrow/multiply/utils/leverage"
import { ReserveLabel } from "@/modules/borrow/reserve/components/ReserveLabel"
import { useAssets } from "@/providers/assetsProvider"
import { numericallyStr, sortBy } from "@/utils/sort"

const columnHelper = createColumnHelper<MultiplyReserveRow>()

export const useMultiplyAssetsTableColumns = () => {
  const { t } = useTranslation(["common", "borrow"])
  const { getAsset } = useAssets()

  return useMemo(() => {
    const collateralColumn = columnHelper.display({
      id: "collateralAsset",
      header: t("borrow:multiply.detail.collateralAsset"),
      cell: ({ row }) => (
        <ReserveLabel reserve={row.original.reserve.reserve} />
      ),
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
          Number(row.original.reserve.reserve.supplyAPY) * 100
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
      sortingFn: sortBy({
        select: (row) =>
          String(getMaxReserveLeverage(row.original.reserve.reserve)),
        compare: numericallyStr,
      }),
      meta: {
        sx: { textAlign: "right" },
      },
      cell: ({ row }) => {
        const maxLeverage = getMaxReserveLeverage(row.original.reserve.reserve)
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
      sortingFn: sortBy({
        select: (row) =>
          row.original.reserve.reserve.availableLiquidityUSD ?? "0",
        compare: numericallyStr,
      }),
      meta: {
        sx: { textAlign: "right" },
      },
      cell: ({ row }) => {
        const liquidity = row.original.reserve.reserve.availableLiquidityUSD
          ? t("common:currency.compact", {
              value: Number(row.original.reserve.reserve.availableLiquidityUSD),
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
