import { CupSoda, Trash } from "@galacticcouncil/ui/assets/icons"
import { Amount, Button, Flex, Text } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/table-core"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { Logo } from "@/components/Logo/Logo"
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
          <Text fs="p6" fw={500} whiteSpace="nowrap">
            {t("liquidity:liquidity.stablepool.position", {
              value: row.index + 1,
            })}
          </Text>
        ),
      }),
      columnHelper.display({
        header: t("liquidity:liquidity.positions.header.initialAmount"),
        cell: ({
          row: {
            original: { data },
          },
        }) =>
          data?.initialValueHuman ? (
            <Amount
              value={t("currency", {
                value: data.initialValueHuman,
                symbol: data.meta?.symbol,
              })}
              displayValue={t("currency", {
                value: data.initialDisplay,
              })}
            />
          ) : (
            "-"
          ),
      }),
      columnHelper.display({
        header: t("liquidity:liquidity.positions.header.currentValue"),
        cell: ({
          row: {
            original: { data },
          },
        }) =>
          data?.currentValueHuman ? (
            <Amount
              value={`${t("currency", { value: data.currentValueHuman, symbol: data.meta?.symbol })} ${data.currentHubValueHuman && Big(data.currentHubValueHuman).gt(0) ? t("currency", { value: data.currentHubValueHuman, symbol: hub.symbol, prefix: " + " }) : ""}`}
              displayValue={t("currency", {
                value: data.currentTotalDisplay,
              })}
            />
          ) : (
            "-"
          ),
      }),
      columnHelper.display({
        header: t("liquidity:liquidity.positions.header.joinedFarms"),
        cell: ({
          row: {
            original: { joinedFarms },
          },
        }) => (joinedFarms.length ? <Logo id={joinedFarms} /> : null),
      }),
      columnHelper.display({
        header: t("liquidity:liquidity.positions.header.actions"),
        size: 180,
        cell: ({ row }) => (
          <Flex gap={getTokenPx("containers.paddings.tertiary")} justify="end">
            {!row.original.joinedFarms.length && (
              <Button variant="primary" asChild>
                <Link
                  to="/liquidity/$id/join"
                  params={{
                    id: row.original.poolId,
                  }}
                  search={{
                    positionId: row.original.positionId,
                  }}
                >
                  <CupSoda />
                  {t("join")}
                </Link>
              </Button>
            )}
            <Button variant="tertiary" outline sx={{ flexShrink: 0 }} asChild>
              <Link
                to="/liquidity/$id/remove"
                params={{
                  id: row.original.poolId,
                }}
                search={{
                  positionId: row.original.positionId,
                }}
              >
                <Trash />
              </Link>
            </Button>
          </Flex>
        ),
      }),
    ],
    [t, hub.symbol],
  )
}
