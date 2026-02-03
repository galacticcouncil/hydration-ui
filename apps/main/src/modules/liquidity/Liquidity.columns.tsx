import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Icon,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
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

export const getPoolColumnsVisibility = (isMobile: boolean) => ({
  ["meta.name"]: !isMobile,
  price: !isMobile,
  volumeDisplay: true,
  tvlDisplay: !isMobile,
  totalFee: !isMobile,
  id: false,
  actions: !isMobile,
})

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
            <AssetLabelFull asset={row.original.meta} withName={!isMobile} />
          ),
        sortingFn: (a, b) =>
          a.original.meta.symbol.localeCompare(b.original.meta.symbol),
      }),
      columnHelper.accessor("price", {
        header: t("price"),
        cell: ({ row }) => (
          <AssetPrice assetId={row.original.id} maximumFractionDigits={null} />
        ),
        sortingFn: (a, b) =>
          new Big(a.original.price ?? 0).gt(b.original.price ?? 0) ? 1 : -1,
      }),
      columnHelper.accessor("volumeDisplay", {
        header: t("liquidity:24hVolume"),
        meta: {
          sx: { textAlign: isMobile ? "right" : "left" },
        },
        cell: ({ row }) => {
          const volume = t("currency", {
            value: Number(row.original.volumeDisplay),
          })
          return row.original.isVolumeLoading ? (
            <Skeleton width={60} height="1em" />
          ) : isMobile ? (
            <Flex align="center" gap="s" justify="flex-end">
              {volume}
              <Icon
                component={ChevronRight}
                size="m"
                color={getToken("text.low")}
              />
            </Flex>
          ) : (
            volume
          )
        },
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
        header: t("yield"),
        sortingFn: (a, b) =>
          numericallyStrDesc(
            b.original.totalFee ?? "0",
            a.original.totalFee ?? "0",
          ),
        cell: ({ row: { original } }) => {
          if (original.isFeeLoading) {
            return <Skeleton width={60} height="1em" />
          }

          if (!original.borrowApyData && !original.isFarms) {
            return (
              <Text>
                {t("percent", {
                  value: Number(original.totalFee),
                })}
              </Text>
            )
          }

          const incentivesIcons: string[] = []

          original.farms.forEach((farm) => {
            incentivesIcons.push(farm.rewardCurrency.toString())
          })

          original.borrowApyData?.incentives.forEach((incentive) => {
            incentivesIcons.push(
              getAssetIdFromAddress(incentive.rewardTokenAddress),
            )
          })

          return (
            <TooltipAPR
              farms={original.farms}
              omnipoolFee={original.lpFeeOmnipool}
              stablepoolFee={original.lpFeeStablepool}
              borrowApyData={original.borrowApyData}
            >
              <Flex align="center" gap="s">
                {!!incentivesIcons.length && (
                  <AssetLogo id={incentivesIcons} size="extra-small" />
                )}
                <Text color={getToken("text.tint.secondary")}>
                  {t("percent", {
                    value: Number(original.totalFee),
                  })}
                </Text>
              </Flex>
            </TooltipAPR>
          )
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
  const stablepoolData = pool.stablepoolData
  const { canAddLiquidity } = pool
  return (
    <>
      <Flex
        gap="s"
        justify="end"
        onClick={(e) => e.stopPropagation()}
        sx={{ position: "relative" }}
      >
        <Button
          asChild
          variant="accent"
          outline
          disabled={!canAddLiquidity || pool.isNative}
        >
          <Link
            to="/liquidity/$id/add"
            search={
              stablepoolData
                ? {
                    stableswapId: stablepoolData.id.toString(),
                    erc20Id: stablepoolData.aToken?.id.toString(),
                  }
                : undefined
            }
            params={{ id: pool.id }}
          >
            {t("liquidity:joinPool")}
          </Link>
        </Button>
        <Button variant="tertiary" outline asChild>
          <Link
            to="/liquidity/$id"
            params={{ id: pool.id }}
            search={{ expanded: true }}
          >
            {isPositions ? t("manage") : t("details")}
          </Link>
        </Button>
        {total !== "0" && (
          <Text
            color={getToken("text.tint.secondary")}
            fw={500}
            fs="p6"
            sx={{
              position: "absolute",
              bottom: "-xl",
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
