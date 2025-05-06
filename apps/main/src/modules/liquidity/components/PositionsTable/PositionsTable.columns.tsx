import { CupSoda, Trash } from "@galacticcouncil/ui/assets/icons"
import { Amount, Button, Flex, Text } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/table-core"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { useAssets } from "@/providers/assetsProvider"

import { PositionTableData } from "./PositionsTable"

const columnHelper = createColumnHelper<PositionTableData>()

export const usePositionsTableColumns = () => {
  const { hub } = useAssets()
  const { t } = useTranslation(["common", "liquidity"])

  return useMemo(
    () => [
      columnHelper.display({
        id: "position",
        header: t("position"),
        cell: ({ row }) => (
          <Text fs="p6" fw={500} sx={{ whiteSpace: "nowrap" }}>
            {t("liquidity:liquidity.stablepool.position", {
              value: row.index + 1,
            })}
          </Text>
        ),
      }),
      columnHelper.display({
        header: t("liquidity:liquidity.positions.header.initialAmount"),
        cell: ({ row }) =>
          row.original.initialValueHuman ? (
            <Amount
              value={t("currency", {
                value: row.original.initialValueHuman,
                symbol: row.original.meta?.symbol,
              })}
              displayValue={t("currency", {
                value: row.original.initialDisplay,
              })}
            />
          ) : (
            "-"
          ),
      }),
      columnHelper.display({
        header: t("liquidity:liquidity.positions.header.currentValue"),
        cell: ({ row: { original } }) =>
          original.currentValueHuman ? (
            <Amount
              value={`${t("currency", { value: original.currentValueHuman, symbol: original.meta?.symbol })} ${original.currentHubValueHuman && Big(original.currentHubValueHuman).gt(0) ? t("currency", { value: original.currentHubValueHuman, symbol: hub.symbol, prefix: " + " }) : ""}`}
              displayValue={t("currency", {
                value: original.currentTotalDisplay,
              })}
            />
          ) : (
            "-"
          ),
      }),
      columnHelper.display({
        header: t("liquidity:liquidity.positions.header.joinedFarms"),
        cell: () => null,
      }),
      columnHelper.display({
        header: t("liquidity:liquidity.positions.header.actions"),
        size: 180,
        cell: () => (
          <Flex gap={getTokenPx("containers.paddings.tertiary")}>
            <Button variant="primary" iconStart={CupSoda}>
              {t("join")}
            </Button>
            <Button
              variant="tertiary"
              outline
              iconStart={Trash}
              sx={{ flexShrink: 0 }}
            />
          </Flex>
        ),
      }),
    ],
    [t, hub.symbol],
  )
}
