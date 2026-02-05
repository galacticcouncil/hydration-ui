import { ChevronRight } from "@galacticcouncil/ui/assets/icons"
import {
  AssetLabel,
  Box,
  Button,
  Flex,
  Icon,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/table-core"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFullContainer } from "@/components/AssetLabelFull"
import { AssetLogo } from "@/components/AssetLogo"
import { TooltipAPR } from "@/modules/liquidity/components/Farms/TooltipAPR"
import { useUserIsolatedPositionsTotal } from "@/modules/liquidity/components/PositionsTable/PositionsTable.utils"

import { IsolatedPoolTable } from "./Liquidity.utils"

const isolatedColumnHelper = createColumnHelper<IsolatedPoolTable>()

export const getIsolatedPoolsColumnsVisibility = (
  isMobile: boolean,
  isMyLiquidity: boolean,
) => ({
  ["meta.name"]: !isMobile,
  volumeDisplay: !isMobile || !isMyLiquidity,
  tvlDisplay: !isMobile,
  actions: !isMobile,
  positions: isMobile && isMyLiquidity,
})

export const useIsolatedPoolsColumns = () => {
  const { t } = useTranslation(["common", "liquidity"])
  const { isMobile } = useBreakpoints()

  return useMemo(
    () => [
      isolatedColumnHelper.accessor("meta.name", {
        size: 250,
        header: t("liquidity:liquidity.pool.poolAsset"),
        cell: ({ row: { original } }) => (
          <AssetLabelWithFarmApr pool={original} />
        ),
      }),
      isolatedColumnHelper.accessor("volumeDisplay", {
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
      isolatedColumnHelper.accessor("tvlDisplay", {
        header: t("liquidity:totalValueLocked"),
        cell: ({ row }) =>
          t("currency", {
            value: Number(row.original.tvlDisplay),
          }),
        sortingFn: (a, b) =>
          new Big(a.original.tvlDisplay).gt(b.original.tvlDisplay) ? 1 : -1,
      }),
      isolatedColumnHelper.display({
        id: "positions",
        header: t("liquidity:yourLiquidity"),
        cell: ({ row }) => <PositionsTotal pool={row.original} />,
      }),
      isolatedColumnHelper.display({
        id: "actions",
        size: 170,
        cell: ({ row }) => {
          return <Actions pool={row.original} />
        },
      }),
    ],
    [t, isMobile],
  )
}

const PositionsTotal = ({ pool }: { pool: IsolatedPoolTable }) => {
  const { t } = useTranslation(["common", "liquidity"])

  const total = useUserIsolatedPositionsTotal(pool)

  return (
    <Flex align="center" gap="s" justify="flex-end">
      {total !== "0" && (
        <>
          {t("currency", {
            value: total,
          })}
        </>
      )}
      <Icon component={ChevronRight} size="m" color={getToken("text.low")} />
    </Flex>
  )
}

const Actions = ({ pool }: { pool: IsolatedPoolTable }) => {
  const { t } = useTranslation(["common", "liquidity"])
  const { isPositions } = pool
  const total = useUserIsolatedPositionsTotal(pool)

  return (
    <Flex
      gap="s"
      justify="end"
      onClick={(e) => e.stopPropagation()}
      sx={{ position: "relative" }}
    >
      <Button variant="accent" outline asChild>
        <Link to="/liquidity/$id/add" params={{ id: pool.id }}>
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
  )
}

export const AssetLabelWithFarmApr = ({
  pool,
}: {
  pool: IsolatedPoolTable
}) => {
  const { t } = useTranslation("common")

  return (
    <AssetLabelFullContainer>
      <AssetLogo id={pool.meta.iconId} />
      {pool.isFarms ? (
        <Box>
          <AssetLabel symbol={pool.meta.symbol} />
          <Flex align="center" gap="s">
            <AssetLogo
              id={pool.farms.map((farm) => farm.rewardCurrency.toString())}
              size="extra-small"
            />
            <Text color={getToken("text.tint.secondary")} fs="p6" lh={1}>
              {t("percent", {
                value: Number(
                  pool.farms
                    .reduce((acc, farm) => acc.plus(farm.apr), new Big(0))
                    .toString(),
                ),
              })}
            </Text>
            <TooltipAPR farms={pool.farms} />
          </Flex>
        </Box>
      ) : (
        <AssetLabel symbol={pool.meta.symbol} />
      )}
    </AssetLabelFullContainer>
  )
}
