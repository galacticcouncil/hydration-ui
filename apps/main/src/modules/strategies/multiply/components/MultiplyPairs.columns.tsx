import { Ellipsis, Eye, Trash } from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  AssetLabel,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Flex,
  MenuItemIcon,
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
import { SMenuLabelText } from "@/modules/strategies/multiply/components/MultiplyPairs.styled"
import { apyColor } from "@/modules/strategies/multiply/components/MultiplyStat"
import {
  RiskBadge,
  RiskBadgeSkeleton,
} from "@/modules/strategies/multiply/components/RiskBadge"
import {
  isCustomLoop,
  type MultiplyPair,
} from "@/modules/strategies/multiply/config/pairs"
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

export const useMultiplyPairColumns = (
  onDeposit: (pair: MultiplyPair) => void,
  onDetails: (pair: MultiplyPair) => void,
) => {
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
          if (!data) return row.original.isLoading ? <RiskBadgeSkeleton /> : "—"
          // with the reserves loaded, risk is null only while the price history loads
          if (!risk) return <RiskBadgeSkeleton />
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
        meta: { sx: { textAlign: "right" } },
        cell: ({ row }) => {
          const { pair } = row.original
          const deposit = (
            <Button
              size="small"
              variant="secondary"
              onClick={() => onDeposit(pair)}
            >
              {t("common:deposit")}
            </Button>
          )
          const hasPosition = !canRemoveLoop(pair.slug, positionSlugs)
          const removeItem = (
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
                <MenuItemIcon component={Trash} />
                <MenuItemLabel>
                  <SMenuLabelText>{t("multiply.custom.remove")}</SMenuLabelText>
                </MenuItemLabel>
              </MenuSelectionItem>
            </DropdownMenuItem>
          )
          return (
            <Flex justify="flex-end" gap="s">
              {deposit}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="tertiary"
                    outline
                    size="small"
                    icon={Ellipsis}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" size="small">
                  <DropdownMenuItem asChild>
                    <MenuSelectionItem
                      variant="filterLink"
                      onClick={() => onDetails(pair)}
                    >
                      <MenuItemIcon component={Eye} />
                      <MenuItemLabel>
                        <SMenuLabelText>{t("common:details")}</SMenuLabelText>
                      </MenuItemLabel>
                    </MenuSelectionItem>
                  </DropdownMenuItem>
                  {isCustomLoop(pair) &&
                    (hasPosition ? (
                      <Tooltip
                        text={t("multiply.custom.removeDisabled")}
                        asChild
                      >
                        <div>{removeItem}</div>
                      </Tooltip>
                    ) : (
                      removeItem
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </Flex>
          )
        },
      }),
    ],
    [t, display, positionSlugs, remove, onDeposit, onDetails],
  )
}
