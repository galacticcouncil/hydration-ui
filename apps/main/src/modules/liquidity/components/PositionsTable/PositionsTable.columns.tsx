import { CupSoda, Plus, Trash } from "@galacticcouncil/ui/assets/icons"
import { Amount, Button, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { createColumnHelper } from "@tanstack/table-core"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import {
  AssetLabelFull,
  AssetLabelXYK,
} from "@/components/AssetLabelFull/AssetLabelFull"
import { Logo } from "@/components/Logo/Logo"
import { useAssets } from "@/providers/assetsProvider"

import {
  IsolatedPositionTableData,
  OmnipoolPositionTableData,
} from "./PositionsTable.utils"
import { BalanceTableData } from "./StableswapBalanceTable"

const omnipoolColumnHelper = createColumnHelper<OmnipoolPositionTableData>()
const balanceColumnHelper = createColumnHelper<BalanceTableData>()
const isolatedColumnHelper = createColumnHelper<IsolatedPositionTableData>()

export const useOmnipoolPositionsTableColumns = (isFarms: boolean) => {
  const { hub } = useAssets()
  const { t } = useTranslation(["common", "liquidity"])

  return useMemo(
    () => [
      omnipoolColumnHelper.display({
        id: "position",
        size: 200,
        header: t("position"),
        cell: ({ row }) => (
          <AssetLabelFull asset={row.original.meta} withName={false} />
        ),
      }),
      omnipoolColumnHelper.display({
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
      omnipoolColumnHelper.display({
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
      omnipoolColumnHelper.accessor("joinedFarms", {
        header: t("liquidity:liquidity.positions.header.joinedFarms"),
        meta: {
          visibility: isFarms,
        },
        enableSorting: false,
        size: 100,
        cell: ({
          row: {
            original: { joinedFarms },
          },
        }) => (joinedFarms.length ? <Logo id={joinedFarms} /> : null),
      }),
      omnipoolColumnHelper.display({
        header: t("liquidity:liquidity.positions.header.actions"),
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        cell: ({ row }) => (
          <Flex gap={getTokenPx("containers.paddings.tertiary")} justify="end">
            {isFarms && !row.original.joinedFarms.length && (
              <Button variant="primary" asChild>
                {/* <Link
                  to="/liquidity/$id/join"
                  params={{
                    id: row.original.poolId,
                  }}
                  search={{
                    positionId: row.original.positionId,
                  }}
                > */}
                <CupSoda />
                {t("liquidity:joinFarms")}
                {/* </Link> */}
              </Button>
            )}
            <Button variant="tertiary" outline sx={{ flexShrink: 0 }} asChild>
              {/* <Link
                to="/liquidity/$id/remove"
                params={{
                  id: row.original.poolId,
                }}
                search={{
                  positionId: row.original.positionId,
                }}
              > */}
              <Trash />
              {t("remove")}
              {/* </Link> */}
            </Button>
          </Flex>
        ),
      }),
    ],
    [t, hub.symbol, isFarms],
  )
}

export const useBalanceTableColumns = () => {
  const { t } = useTranslation(["common", "liquidity"])

  return useMemo(
    () => [
      balanceColumnHelper.display({
        id: "label",
        size: 250,
        header: t("position"),
        cell: ({
          row: {
            original: { label },
          },
        }) => (
          <Text
            fs="p5"
            fw={500}
            color={getToken("text.high")}
            sx={{ whiteSpace: "nowrap" }}
          >
            {label}
          </Text>
        ),
      }),
      balanceColumnHelper.display({
        header: t("totalValue"),
        cell: ({
          row: {
            original: { value, valueDisplay },
          },
        }) => (
          <Amount
            value={t("currency", {
              value: value,
              symbol: "Shares",
            })}
            displayValue={t("currency", {
              value: valueDisplay,
            })}
          />
        ),
      }),
      balanceColumnHelper.display({
        header: t("liquidity:liquidity.positions.header.actions"),
        size: 320,
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        cell: ({
          row: {
            original: { isStablepoolInOmnipool },
          },
        }) => (
          <Flex gap={12} align="center">
            {isStablepoolInOmnipool && (
              <Button variant="primary" sx={{ flex: [1, "auto"] }} asChild>
                {/* <Link
                  to="/liquidity/$id/add"
                  params={{
                    id: poolId,
                  }}
                > */}
                <Plus />
                {t("liquidity:addLiquidity")}
                {/* </Link> */}
              </Button>
            )}
            <Button
              variant="tertiary"
              outline
              sx={{ flex: [1, "auto"] }}
              asChild
            >
              {/* <Link
                to="/liquidity/$id/remove"
                params={{
                  id: poolId,
                }}
              > */}
              <Trash />
              {t("remove")}
              {/* </Link> */}
            </Button>
          </Flex>
        ),
      }),
    ],
    [t],
  )
}

export const useIsolatedPositionsTableColumns = (isFarms: boolean) => {
  const { t } = useTranslation(["common", "liquidity"])

  return useMemo(
    () => [
      isolatedColumnHelper.display({
        id: "position",
        size: 250,
        header: t("position"),
        cell: ({ row }) => (
          <AssetLabelXYK
            iconIds={row.original.meta.iconId}
            symbol={row.original.meta.symbol}
          />
        ),
      }),
      isolatedColumnHelper.display({
        header: t("liquidity:liquidity.positions.header.amount"),
        cell: ({ row: { original } }) => (
          <Amount
            value={t("currency", {
              value: original.shareTokens,
              symbol: "Shares",
            })}
            displayValue={t("currency", {
              value: original.shareTokensDisplay,
            })}
          />
        ),
      }),
      isolatedColumnHelper.accessor("joinedFarms", {
        header: t("liquidity:liquidity.positions.header.joinedFarms"),
        size: 150,
        meta: {
          visibility: isFarms,
        },
        enableSorting: false,
        cell: ({
          row: {
            original: { joinedFarms },
          },
        }) => (joinedFarms.length ? <Logo id={joinedFarms} /> : null),
      }),
      isolatedColumnHelper.display({
        header: t("liquidity:liquidity.positions.header.actions"),
        size: 300,
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        cell: ({
          row: {
            original: { positionId },
          },
        }) => (
          <Flex gap={12} align="center" justify="end">
            {isFarms && !positionId && (
              <Button variant="primary" asChild>
                {/* <Link
                  to="/liquidity/$id/add"
                  params={{
                    id: poolId,
                  }}
                > */}
                <Plus />
                {t("liquidity:joinFarms")}
                {/* </Link> */}
              </Button>
            )}
            <Button variant="tertiary" outline asChild>
              {/* <Link
                to="/liquidity/$id/remove"
                params={{
                  id: poolId,
                }}
                search={{
                  all: positionId ? true : false,
                  positionId,
                  shareTokenId: !positionId ? shareTokenId : undefined,
                }}
              > */}
              <Trash />
              {t("remove")}
              {/* </Link> */}
            </Button>
          </Flex>
        ),
      }),
    ],
    [t, isFarms],
  )
}
