import {
  Amount,
  AssetLabel,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFullContainer } from "@/components/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"
import { type useMultiplyPairsMetrics } from "@/modules/strategies/multiply/hooks/useMultiplyPairMetrics"
import { useAssets } from "@/providers/assetsProvider"

export type MultiplyPairRow = ReturnType<typeof useMultiplyPairsMetrics>[number]

const columnHelper = createColumnHelper<MultiplyPairRow>()

const AssetCell: React.FC<{ id: string }> = ({ id }) => {
  const { getAssetWithFallback } = useAssets()
  return (
    <AssetLabelFullContainer>
      <AssetLogo id={id} />
      <AssetLabel symbol={getAssetWithFallback(id).symbol} />
    </AssetLabelFullContainer>
  )
}

export const useMultiplyPairColumns = () => {
  const { t } = useTranslation(["strategies", "common"])
  const { getAssetWithFallback } = useAssets()

  return useMemo(
    () => [
      columnHelper.display({
        id: "collateral",
        header: t("multiply.details.collateral"),
        cell: ({ row }) => (
          <AssetCell id={row.original.pair.collateralAssetId} />
        ),
      }),
      columnHelper.display({
        id: "debt",
        header: t("multiply.details.debt"),
        cell: ({ row }) => <AssetCell id={row.original.pair.debtAssetId} />,
      }),
      columnHelper.display({
        id: "maxApy",
        header: t("cards.multiply.maxApy"),
        cell: ({ row }) => {
          const apy = row.original.data?.maxNetApy ?? null
          if (apy === null && row.original.isLoading)
            return <Skeleton width={48} />
          return (
            <Text
              fs="p4"
              fw={600}
              color={getToken(
                apy !== null && apy > 0
                  ? "accents.success.emphasis"
                  : "text.high",
              )}
            >
              {apy === null ? "—" : t("common:percent", { value: apy * 100 })}
            </Text>
          )
        },
      }),
      columnHelper.display({
        id: "maxLeverage",
        header: t("cards.multiply.maxLeverage"),
        cell: ({ row }) => (
          <Text fs="p4" fw={500}>
            {row.original.data
              ? t("cards.multiply.leverage", {
                  value: row.original.data.maxLeverage,
                })
              : "—"}
          </Text>
        ),
      }),
      columnHelper.display({
        id: "liquidity",
        header: t("multiply.details.liquidityAvailable"),
        cell: ({ row }) => {
          const { pair, data, debtReserve } = row.original
          const liquidity = data?.availableLiquidity ?? null
          if (liquidity === null) return "—"
          return (
            <Amount
              value={t("common:currency.compact", {
                value: liquidity,
                symbol: getAssetWithFallback(pair.debtAssetId).symbol,
              })}
              displayValue={t("common:currency.compact", {
                value: Number(liquidity) * Number(debtReserve?.priceInUsd ?? 0),
              })}
            />
          )
        },
      }),
    ],
    [t, getAssetWithFallback],
  )
}
