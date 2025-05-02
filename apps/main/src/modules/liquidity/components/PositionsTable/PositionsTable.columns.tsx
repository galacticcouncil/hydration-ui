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
  const { t } = useTranslation("common")
  return useMemo(
    () => [
      columnHelper.display({
        id: "position",
        header: "Position",
        cell: ({ row }) => (
          <Text fs="p6" fw={500} sx={{ whiteSpace: "nowrap" }}>
            {row.original.label}
          </Text>
        ),
      }),
      columnHelper.display({
        header: "Initial Amount",
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
        header: "Current Value",
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
        header: "Joined Farms",
        cell: () => null,
      }),
      columnHelper.display({
        header: "Actions",
        size: 180,
        cell: () => (
          <Flex gap={getTokenPx("containers.paddings.tertiary")}>
            <Button variant="primary" iconStart={CupSoda}>
              Join
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
