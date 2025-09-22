import { Link } from "@tanstack/react-location"
import { createColumnHelper } from "@tanstack/react-table"
import { useBestNumber } from "api/chain"
import { TFarmAprData, useFarmCurrentPeriod, useOmnipoolFarms } from "api/farms"
import { useOmnipoolDataObserver } from "api/omnipool"
import BN from "bignumber.js"
import { AssetLogo, MultipleAssetLogo } from "components/AssetIcon/AssetIcon"
import { CopyButton } from "components/CopyButton/CopyButton"
import { Icon } from "components/Icon/Icon"
import { LinearProgress } from "components/Progress/LinearProgress/LinearProgress"
import { Text } from "components/Typography/Text/Text"
import { addSeconds, isPast } from "date-fns"
import { useAssets } from "providers/assets"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { shortenAccountAddress } from "utils/formatting"
import { LINKS } from "utils/navigation"

type FarmsFilter = "all" | "ongoing" | "finished"

export const useFarmsTableData = (filter: FarmsFilter) => {
  const { data: bestNumber } = useBestNumber()
  const { data: omnipoolAssets, isLoading: isOmnipoolAssetLoading } =
    useOmnipoolDataObserver()

  const relaychainBlockNumber =
    bestNumber?.relaychainBlockNumber?.toString() ?? "0"

  const omnipoolIds = omnipoolAssets?.map((asset) => asset.id) ?? []
  const { data: allFarms, isLoading: isFarmsLoading } =
    useOmnipoolFarms(omnipoolIds)

  const data = useMemo(() => {
    if (!allFarms) return []
    const farms = [...allFarms.values()]
      .flatMap(({ farms }) => farms)
      .sort((a, b) => BN(a.estimatedEndBlock).comparedTo(b.estimatedEndBlock))

    switch (filter) {
      case "ongoing":
        return farms.filter((farm) =>
          BN(farm.estimatedEndBlock).gt(relaychainBlockNumber),
        )
      case "finished":
        return farms.filter((farm) =>
          BN(farm.estimatedEndBlock).lt(relaychainBlockNumber),
        )
      default:
        return farms
    }
  }, [allFarms, filter, relaychainBlockNumber])

  return {
    data,
    isLoading: isFarmsLoading || isOmnipoolAssetLoading,
  }
}

const columnHelper = createColumnHelper<TFarmAprData>()

export const useFarmsTableColumns = () => {
  const { getAssetWithFallback } = useAssets()
  const { getSecondsToLeft } = useFarmCurrentPeriod()
  const { t } = useTranslation()
  return useMemo(
    () => [
      columnHelper.accessor("globalFarmId", {
        header: t("farms.overview.table.globalFarmId"),
      }),
      columnHelper.accessor("poolId", {
        header: t("farms.overview.table.poolId"),
        cell: ({ row }) => {
          const asset = getAssetWithFallback(row.original.poolId)
          return (
            <Link
              to={LINKS.allPools}
              search={{ id: row.original.poolId }}
              sx={{ flex: "row", align: "center", gap: 8 }}
            >
              <MultipleAssetLogo
                iconId={
                  asset.isStableSwap && asset.meta
                    ? Object.keys(asset.meta)
                    : asset.id
                }
              />
              <Text
                fs={14}
                font="GeistMedium"
                css={{ textDecoration: "underline" }}
              >
                {asset.symbol}
              </Text>
            </Link>
          )
        },
      }),
      columnHelper.accessor("rewardCurrency", {
        header: t("farms.overview.table.rewardCurrency"),
        cell: ({ row }) => {
          const reward = getAssetWithFallback(row.original.rewardCurrency)
          return (
            <div sx={{ flex: "row", align: "center", gap: 4 }}>
              <Icon size={16} icon={<AssetLogo id={reward.id} />} />
              <Text fs={14}>{reward.symbol}</Text>
            </div>
          )
        },
      }),
      columnHelper.accessor("diffRewards", {
        header: t("farms.overview.table.diffRewards"),
        sortingFn: (a, b) =>
          BN(a.original.diffRewards).gt(b.original.diffRewards) ? 1 : -1,
        meta: {
          sx: {
            textAlign: "center",
          },
        },
        cell: ({ row }) => {
          const diff = BN(row.original.diffRewards)
          return (
            <>
              <Text fs={10}>
                {t("farms.details.card.distribution.short", {
                  distributed: row.original.distributedRewards,
                  max: row.original.maxRewards,
                })}
              </Text>
              <LinearProgress
                color={diff.gte(100) ? "pink700" : "basic500"}
                size="small"
                percent={diff.toNumber()}
                withoutLabel
              />
            </>
          )
        },
      }),
      columnHelper.accessor("apr", {
        header: t("farms.overview.table.apr"),
        sortingFn: (a, b) => (BN(a.original.apr).gt(b.original.apr) ? 1 : -1),
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        cell: ({ row }) => {
          const value = BN(row.original.apr)
          return (
            <span sx={{ color: value.gt(0) ? "brightBlue300" : "basic500" }}>
              {t("value.percentage", { value })}
            </span>
          )
        },
      }),
      columnHelper.accessor("fullness", {
        header: t("farms.overview.table.fullness"),
        sortingFn: (a, b) =>
          BN(a.original.fullness).gt(b.original.fullness) ? 1 : -1,
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        cell: ({ row }) => {
          const value = BN(row.original.fullness)
          return t("value.percentage", { value })
        },
      }),
      columnHelper.accessor("estimatedEndBlock", {
        header: t("farms.overview.table.estimatedEndBlock"),
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        cell: ({ row }) => {
          const secondsToLeft = getSecondsToLeft(row.original.estimatedEndBlock)

          if (!secondsToLeft)
            return (
              <Text fs={14} color="basic400">
                -
              </Text>
            )

          const endDate = addSeconds(new Date(), secondsToLeft.toNumber())

          return (
            <time
              dateTime={endDate.toISOString()}
              title={t("date.datetime", { value: endDate })}
              sx={{ color: isPast(endDate) ? "basic500" : "white" }}
            >
              {t("date.relative", {
                value: endDate,
              })}
            </time>
          )
        },
      }),
      columnHelper.accessor("potAddress", {
        header: t("farms.overview.table.potAddress"),
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        cell: ({ row }) => (
          <div sx={{ flex: "row", align: "center", gap: 8, justify: "end" }}>
            <Text fs={14}>
              {shortenAccountAddress(row.original.potAddress)}
            </Text>
            <CopyButton iconSize={16} text={row.original.potAddress} />
          </div>
        ),
      }),
    ],
    [getAssetWithFallback, t, getSecondsToLeft],
  )
}
