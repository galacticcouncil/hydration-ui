import { Ellipsis } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  AssetLabel,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  MenuItemLabel,
  MenuSelectionItem,
  Skeleton,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { createColumnHelper } from "@tanstack/react-table"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFullContainer } from "@/components/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"
import { useResolveAssetDisplay } from "@/modules/money-market/reserves/useReserveDisplay"
import { apyColor } from "@/modules/strategies/multiply/components/MultiplyStat"
import { RiskBadge } from "@/modules/strategies/multiply/components/RiskBadge"
import { isCustomLoop } from "@/modules/strategies/multiply/config/pairs"
import { useCustomLoopsStore } from "@/modules/strategies/multiply/hooks/useCustomLoops"
import { type MultiplyPairRow } from "@/modules/strategies/multiply/hooks/useMultiplyPairMetrics"
import { useMultiplyPositions } from "@/modules/strategies/multiply/hooks/useMultiplyPositions"
import { canRemoveLoop } from "@/modules/strategies/multiply/utils/loops"

export type { MultiplyPairRow }

const columnHelper = createColumnHelper<MultiplyPairRow>()

const AssetCell: React.FC<{ id: string }> = ({ id }) => {
  const asset = useResolveAssetDisplay()(id)
  return (
    <AssetLabelFullContainer>
      <AssetLogo id={asset.logoId} />
      <AssetLabel symbol={asset.symbol} />
    </AssetLabelFullContainer>
  )
}

export const useMultiplyPairColumns = () => {
  const { t } = useTranslation(["strategies", "common"])
  const display = useResolveAssetDisplay()
  const remove = useCustomLoopsStore((st) => st.remove)
  const { data: positions } = useMultiplyPositions()
  const positionSlugs = useMemo(
    () => positions?.map((p) => p.pair.slug) ?? [],
    [positions],
  )

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
        id: "risk",
        header: t("multiply.risk.column"),
        cell: ({ row }) => {
          const { pair, risk, data } = row.original
          if (!risk || !data)
            return row.original.isLoading ? <Skeleton width={64} /> : "—"
          return (
            <RiskBadge
              risk={risk}
              collateral={display(pair.collateralAssetId).symbol}
              debt={display(pair.debtAssetId).symbol}
              hf={data.maxLeverageHf}
            />
          )
        },
      }),
      columnHelper.display({
        id: "maxApy",
        header: t("cards.multiply.maxApy"),
        cell: ({ row }) => {
          const apy = row.original.data?.maxNetApy ?? null
          if (apy === null && row.original.isLoading)
            return <Skeleton width={48} />
          return (
            <Text fs="p4" fw={600} color={apyColor(apy)}>
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
                symbol: display(pair.debtAssetId).symbol,
              })}
              displayValue={t("common:currency.compact", {
                value: Number(liquidity) * Number(debtReserve?.priceInUsd ?? 0),
              })}
            />
          )
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const { pair } = row.original
          if (!isCustomLoop(pair)) return null
          const hasPosition = !canRemoveLoop(pair.slug, positionSlugs)
          const item = (
            <DropdownMenuItem asChild disabled={hasPosition}>
              <MenuSelectionItem
                variant="filterLink"
                onClick={() =>
                  remove({
                    collateralAssetId: pair.collateralAssetId,
                    debtAssetId: pair.debtAssetId,
                  })
                }
              >
                <MenuItemLabel>{t("multiply.custom.remove")}</MenuItemLabel>
              </MenuSelectionItem>
            </DropdownMenuItem>
          )
          return (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="tertiary" outline size="small" px="base">
                  <Icon component={Ellipsis} size="m" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {hasPosition ? (
                  <Tooltip text={t("multiply.custom.removeDisabled")} asChild>
                    <div>{item}</div>
                  </Tooltip>
                ) : (
                  item
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )
        },
      }),
    ],
    [t, display, positionSlugs, remove],
  )
}
