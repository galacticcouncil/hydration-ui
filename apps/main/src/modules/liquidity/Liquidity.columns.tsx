import { Button, Flex, Skeleton, Text } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/table-core"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import {
  AssetLabelFull,
  AssetLabelStablepool,
} from "@/components/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"
import { AssetPrice } from "@/components/AssetPrice"
import { TooltipAPR } from "@/modules/liquidity/components/Farms/TooltipAPR"
import { useUserPositionsTotal } from "@/modules/liquidity/components/PositionsTable/PositionsTable.utils"
import { isStableSwap } from "@/providers/assetsProvider"
import { numericallyStrDesc } from "@/utils/sort"

import { OmnipoolAssetTable } from "./Liquidity.utils"

const columnHelper = createColumnHelper<OmnipoolAssetTable>()

export const usePoolColumns = () => {
  const { t } = useTranslation(["common", "liquidity"])
  const { isMobile } = useBreakpoints()

  return useMemo(
    () => [
      columnHelper.accessor("meta.name", {
        header: t("liquidity:liquidity.pool.poolAsset"),
        size: 250,
        cell: ({ row }) =>
          isStableSwap(row.original.meta) ? (
            <AssetLabelStablepool
              asset={row.original.meta}
              withName={!isMobile}
            />
          ) : (
            <AssetLabelFull asset={row.original.meta} />
          ),
        sortingFn: (a, b) =>
          a.original.meta.symbol.localeCompare(b.original.meta.symbol),
      }),
      columnHelper.accessor("price", {
        header: t("price"),
        cell: ({ row }) => <AssetPrice assetId={row.original.id} />,
        sortingFn: (a, b) =>
          new Big(a.original.price ?? 0).gt(b.original.price ?? 0) ? 1 : -1,
      }),
      columnHelper.accessor("volumeDisplay", {
        header: t("liquidity:24hVolume"),
        cell: ({ row }) =>
          row.original.isVolumeLoading ? (
            <Skeleton width={60} height="1em" />
          ) : (
            t("currency", {
              value: Number(row.original.volumeDisplay),
            })
          ),
        sortingFn: (a, b) =>
          new Big(a.original.volumeDisplay ?? 0).gt(
            b.original.volumeDisplay ?? 0,
          )
            ? 1
            : -1,
      }),
      columnHelper.accessor("tvlDisplay", {
        header: t("liquidity:totalValueLocked"),
        cell: ({ row }) =>
          t("currency", {
            value: Big(row.original.tvlDisplay || "0"),
          }),
        sortingFn: (a, b) =>
          numericallyStrDesc(
            b.original.tvlDisplay || "0",
            a.original.tvlDisplay || "0",
          ),
      }),
      columnHelper.accessor("totalFee", {
        header: t("fee"),
        sortingFn: (a, b) =>
          numericallyStrDesc(
            b.original.totalFee ?? "0",
            a.original.totalFee ?? "0",
          ),
        cell: ({ row: { original } }) => {
          if (original.isFeeLoading) {
            return <Skeleton width={60} height="1em" />
          }

          if (original.isFarms && original?.farms) {
            const farmRewardsIconIds = original.farms.map((farm) =>
              farm.rewardCurrency.toString(),
            )

            return (
              <Flex align="center" gap={4}>
                <AssetLogo id={farmRewardsIconIds} size="extra-small" />
                <Text color={getToken("text.tint.secondary")}>
                  {t("percent", {
                    value: Number(original.totalFee),
                  })}
                </Text>
                <TooltipAPR
                  farms={original.farms}
                  omnipoolFee={original.lpFeeOmnipool}
                  stablepoolFee={original.lpFeeStablepool}
                />
              </Flex>
            )
          }

          return (
            <Text>
              {t("percent", {
                value: Number(original.totalFee),
              })}
            </Text>
          )
        },
      }),
      columnHelper.accessor("id", {
        meta: { visibility: false },
        sortingFn: (a, b) => {
          if (a.original.isNative) return 1
          if (b.original.isNative) return -1

          return new Big(a.original.tvlDisplay ?? "0").gt(
            b.original.tvlDisplay ?? "0",
          )
            ? 1
            : -1
        },
      }),
      columnHelper.accessor("id", {
        meta: { visibility: false },
        sortingFn: (a, b) => {
          if (a.original.isNative) return 1
          if (b.original.isNative) return -1

          return numericallyStrDesc(
            b.original.tvlDisplay ?? "0",
            a.original.tvlDisplay ?? "0",
          )
        },
      }),
      columnHelper.accessor("meta.symbol", {
        meta: { visibility: false },
      }),
      columnHelper.display({
        id: "actions",
        size: 170,
        cell: ({ row }) => <Actions pool={row.original} />,
      }),
    ],

    [t, isMobile],
  )
}

const Actions = ({ pool }: { pool: OmnipoolAssetTable }) => {
  const { t } = useTranslation(["common", "liquidity"])
  const { isPositions } = pool
  const total = useUserPositionsTotal(pool)

  return (
    <>
      <Flex
        gap={getTokenPx("containers.paddings.quint")}
        onClick={(e) => e.stopPropagation()}
        sx={{ position: "relative" }}
      >
        <Button asChild variant="accent" outline>
          <Link
            to={pool.isStablePool ? "/liquidity/$id/add" : "/liquidity/$id/add"}
            params={{ id: pool.id }}
          >
            {t("liquidity:joinPool")}
          </Link>
        </Button>
        <Button variant="tertiary" outline asChild>
          <Link to="/liquidity/$id" params={{ id: pool.id }}>
            {isPositions ? t("manage") : t("details")}
          </Link>
        </Button>
        {total !== "0" && (
          <Text
            color="text.secondary"
            fs={10}
            sx={{
              position: "absolute",
              bottom: -16,
              right: 16,
            }}
          >
            {t("liquidity:liquidity.pool.positions.total", {
              value: total,
            })}
          </Text>
        )}
      </Flex>
    </>
  )
}
