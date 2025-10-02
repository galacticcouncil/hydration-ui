import { Button, Flex, Skeleton, Text } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { Link } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/table-core"
import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelXYK } from "@/components/AssetLabelFull"
import { useUserIsolatedPositionsTotal } from "@/modules/liquidity/components/PositionsTable/PositionsTable.utils"

import { IsolatedPoolTable } from "./Liquidity.utils"

const isolatedColumnHelper = createColumnHelper<IsolatedPoolTable>()

export const useIsolatedPoolsColumns = () => {
  const { t } = useTranslation(["common", "liquidity"])

  return useMemo(
    () => [
      isolatedColumnHelper.accessor("meta.name", {
        header: t("liquidity:liquidity.pool.poolAsset"),
        cell: ({ row: { original } }) => (
          <AssetLabelXYK
            iconIds={original.meta.iconId}
            symbol={original.meta.symbol}
            farms={original.farms}
          />
        ),
      }),
      isolatedColumnHelper.accessor("volumeDisplay", {
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
      isolatedColumnHelper.accessor("tvlDisplay", {
        header: t("liquidity:totalValueLocked"),
        cell: ({ row }) =>
          t("currency", {
            value: Number(row.original.tvlDisplay),
          }),
        sortingFn: (a, b) =>
          new Big(a.original.tvlDisplay).gt(b.original.tvlDisplay) ? 1 : -1,
      }),
      isolatedColumnHelper.accessor("meta.symbol", {
        meta: { visibility: false },
      }),
      isolatedColumnHelper.display({
        id: "actions",
        size: 170,
        cell: ({ row }) => {
          return <Actions pool={row.original} />
        },
      }),
    ],
    [t],
  )
}

const Actions = ({ pool }: { pool: IsolatedPoolTable }) => {
  const { t } = useTranslation(["common", "liquidity"])
  const { isPositions } = pool
  const total = useUserIsolatedPositionsTotal(pool)

  return (
    <Flex
      gap={getTokenPx("containers.paddings.quint")}
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
  )
}
