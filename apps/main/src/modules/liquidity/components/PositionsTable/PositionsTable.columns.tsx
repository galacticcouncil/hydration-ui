import {
  ChevronRight,
  CupSoda,
  Plus,
  Trash,
} from "@galacticcouncil/ui/assets/icons"
import {
  Amount,
  Button,
  Flex,
  Icon,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/table-core"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import {
  AssetLabelFull,
  AssetLabelXYK,
} from "@/components/AssetLabelFull/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"
import { useFormatOmnipoolPositionData } from "@/states/liquidity"

import {
  BalanceTableData,
  IsolatedPositionTableData,
  OmnipoolPositionTableData,
} from "./PositionsTable.utils"

const omnipoolColumnHelper = createColumnHelper<
  OmnipoolPositionTableData | BalanceTableData
>()
const balanceColumnHelper = createColumnHelper<BalanceTableData>()
const isolatedColumnHelper = createColumnHelper<IsolatedPositionTableData>()

export const isOmnipoolPosition = (
  row: OmnipoolPositionTableData | BalanceTableData,
): row is OmnipoolPositionTableData => {
  return "meta" in row && "data" in row
}

export const useOmnipoolPositionsTableColumns = (isFarms: boolean) => {
  const { t } = useTranslation(["common", "liquidity"])
  const format = useFormatOmnipoolPositionData()

  return useMemo(
    () => [
      omnipoolColumnHelper.display({
        id: "position",
        size: 175,
        meta: {
          sxFn: (original) =>
            !isOmnipoolPosition(original)
              ? {
                  borderLeft: `2px solid`,
                  borderColor: getToken("buttons.primary.high.rest"),
                }
              : {},
        },
        header: t("position"),
        cell: ({ row: { original } }) =>
          isOmnipoolPosition(original) ? (
            <AssetLabelFull asset={original.meta} withName={false} />
          ) : (
            <Text
              fs="p5"
              fw={500}
              color={getToken("text.high")}
              sx={{ whiteSpace: "nowrap" }}
            >
              {original.label}
            </Text>
          ),
      }),
      omnipoolColumnHelper.display({
        header: t("liquidity:liquidity.positions.header.initialAmount"),
        cell: ({ row: { original } }) =>
          isOmnipoolPosition(original) ? (
            <Amount
              value={t("currency", {
                value: original.data.initialValueHuman,
                symbol: original.data.meta.symbol,
              })}
              displayValue={t("currency", {
                value: original.data.initialDisplay,
              })}
            />
          ) : (
            <Amount
              value={t("currency", {
                value: original.value,
                symbol: "Shares",
              })}
              displayValue={t("currency", {
                value: original.valueDisplay,
              })}
            />
          ),
      }),
      omnipoolColumnHelper.display({
        header: t("liquidity:liquidity.positions.header.currentValue"),
        cell: ({ row: { original } }) =>
          isOmnipoolPosition(original) ? (
            <Amount
              value={format(original.data)}
              displayValue={t("currency", {
                value: original.data.currentTotalDisplay,
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
        cell: ({ row: { original } }) =>
          isOmnipoolPosition(original) && original.joinedFarms.length ? (
            <Flex align="center" gap={getTokenPx("containers.paddings.quint")}>
              <AssetLogo
                id={original.joinedFarms.map(({ farm }) =>
                  farm.rewardCurrency.toString(),
                )}
              />
              <Text fs="p6" color={getToken("text.tint.secondary")}>
                {original.aprsByRewardAsset
                  .map((apr) => t("common:percent", { value: apr.totalApr }))
                  .join(" + ")}
              </Text>
            </Flex>
          ) : null,
      }),
      omnipoolColumnHelper.display({
        header: t("liquidity:liquidity.positions.header.actions"),
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        cell: ({ row: { original } }) => {
          const isOmnipool = isOmnipoolPosition(original)

          return (
            <Flex
              gap={getTokenPx("containers.paddings.tertiary")}
              justify="end"
              align="center"
            >
              {isOmnipool ? (
                !original.isJoinedAllFarms ? (
                  <Button variant="primary" asChild>
                    <Link
                      to="/liquidity/$id/join"
                      params={{
                        id: original.poolId,
                      }}
                      search={{
                        positionId: original.positionId,
                      }}
                    >
                      <CupSoda />
                      {t("liquidity:joinFarms")}
                    </Link>
                  </Button>
                ) : null
              ) : original.isStablepoolInOmnipool ? (
                <Button variant="secondary" asChild>
                  <Link
                    to="/liquidity/$id/add"
                    params={{
                      id: original.poolId,
                    }}
                  >
                    <Plus />
                    {t("liquidity:moveToOmnipool")}
                  </Link>
                </Button>
              ) : null}
              <Button variant="tertiary" outline sx={{ flexShrink: 0 }} asChild>
                <Link
                  to="/liquidity/$id/remove"
                  params={{
                    id: original.poolId,
                  }}
                  search={{
                    positionId: isOmnipool ? original.positionId : "",
                    stableswapId: original.stableswapId,
                  }}
                >
                  <Trash />
                  {t("remove")}
                </Link>
              </Button>

              {isOmnipool && !!original.joinedFarms.length && (
                <Icon
                  size={16}
                  component={ChevronRight}
                  sx={{ justifySelf: "flex-end" }}
                />
              )}
            </Flex>
          )
        },
      }),
    ],
    [t, isFarms, format],
  )
}

export const useBalanceTableColumns = () => {
  const { t } = useTranslation(["common", "liquidity"])

  return useMemo(
    () => [
      balanceColumnHelper.display({
        id: "meta_name",
        size: 175,
        header: t("position"),
        cell: ({ row: { original } }) => (
          <AssetLabelFull asset={original.meta} withName={false} />
        ),
      }),
      balanceColumnHelper.display({
        header: t("totalValue"),
        cell: ({
          row: {
            original: { value, valueDisplay, meta },
          },
        }) => (
          <Amount
            value={t("currency", {
              value: value,
              symbol: meta.symbol,
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
            original: { isStablepoolInOmnipool, poolId, stableswapId },
          },
        }) => (
          <Flex gap={12} align="center" justify="end">
            {isStablepoolInOmnipool && (
              <Button variant="secondary" asChild>
                <Link
                  to="/liquidity/$id/add"
                  params={{
                    id: poolId,
                  }}
                  search={{
                    erc20Id: poolId,
                    stableswapId: stableswapId,
                    split: false,
                  }}
                >
                  <Plus />
                  {t("liquidity:moveToOmnipool")}
                </Link>
              </Button>
            )}
            <Button variant="tertiary" outline asChild>
              <Link
                to="/liquidity/$id/remove"
                params={{
                  id: poolId,
                }}
                search={{
                  erc20Id: poolId,
                  stableswapId: stableswapId,
                }}
              >
                <Trash />
                {t("remove")}
              </Link>
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
            original: { joinedFarms, aprsByRewardAsset },
          },
        }) =>
          joinedFarms.length ? (
            <Flex align="center" gap={getTokenPx("containers.paddings.quint")}>
              <AssetLogo
                id={joinedFarms.map(({ farm }) =>
                  farm.rewardCurrency.toString(),
                )}
              />
              <Text fs="p6" color={getToken("text.tint.secondary")}>
                {aprsByRewardAsset
                  .map((apr) => t("common:percent", { value: apr.totalApr }))
                  .join(" + ")}
              </Text>
            </Flex>
          ) : null,
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
            original: { poolId, positionId, shareTokenId },
          },
        }) => (
          <Flex gap={12} align="center" justify="end">
            {isFarms && !positionId && (
              <Button variant="primary" asChild>
                <Link
                  to="/liquidity/$id/join"
                  params={{
                    id: poolId,
                  }}
                  search={{
                    positionId,
                  }}
                >
                  <Plus />
                  {t("liquidity:joinFarms")}
                </Link>
              </Button>
            )}
            <Button variant="tertiary" outline asChild>
              <Link
                to="/liquidity/$id/remove"
                params={{
                  id: poolId,
                }}
                search={{
                  positionId,
                  shareTokenId: !positionId ? shareTokenId : undefined,
                }}
              >
                <Trash />
                {t("remove")}
              </Link>
            </Button>
          </Flex>
        ),
      }),
    ],
    [t, isFarms],
  )
}
