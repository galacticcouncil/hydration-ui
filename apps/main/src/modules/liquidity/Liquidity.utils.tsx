import { OmniMath, PoolBase, PoolToken } from "@galacticcouncil/sdk"
import { Button, Flex } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/table-core"
import Big from "big.js"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { useFee, useOmnipoolAssetsData, useTVL } from "@/api/omnipool"
import { xykPools } from "@/api/pools"
import { AssetLabelFull, AssetLabelXYK, AssetPrice } from "@/components"
import {
  isStableSwap,
  useAssets,
  XYKPoolMeta,
} from "@/providers/assetsProvider"
import { useAccountPositions } from "@/states/account"
import { useAssetsPrice } from "@/states/displayAsset"
import {
  setOmnipoolAssets,
  setXYKPools,
  useOmnipoolIds,
} from "@/states/liquidity"
import { scaleHuman } from "@/utils/formatting"

export type OmnipoolAssetTable = {
  id: string
  meta: TAssetData
  price: string
  tvlDisplay: string
  fee?: string
  isFeeLoading: boolean
  isNative: boolean
  isPositions: boolean
  positionsAmount: number
}

export type IsolatedPoolTable = {
  id: string
  tokens: PoolToken[]
  tvlDisplay: string
  meta: XYKPoolMeta
  isPositions: boolean
}

const columnHelper = createColumnHelper<OmnipoolAssetTable>()
const isolatedColumnHelper = createColumnHelper<IsolatedPoolTable>()

export const useOmnipools = () => {
  const { getAssetWithFallback, native } = useAssets()
  const { ids: omnipoolIds = [] } = useOmnipoolIds()

  const { getPositions } = useAccountPositions()

  const { getAssetPrice, isLoading: isPriceLoading } =
    useAssetsPrice(omnipoolIds)

  const { data: tvls, isLoading: isTvlLoading } = useTVL()
  const { data: fees, isLoading: isFeeLoading } = useFee()

  const isLoading = isPriceLoading || !omnipoolIds.length || isTvlLoading

  const data: OmnipoolAssetTable[] = useMemo(() => {
    if (isLoading) return []

    const omnipoolData = omnipoolIds.map((omnipoolId) => {
      const isNative = native.id === omnipoolId
      const meta = getAssetWithFallback(omnipoolId)
      const price = Big(getAssetPrice(omnipoolId).price).round(5).toString()
      const tvlDisplay = Big(
        tvls?.find((tvl) => tvl?.asset_id === Number(omnipoolId))?.tvl_usd ??
          "NaN",
      ).toString()
      const fee = isNative
        ? undefined
        : fees
            ?.find((fee) => fee?.asset_id === Number(omnipoolId))
            ?.projected_apr_perc.toString()

      const { omnipoolPositions, omnipoolMiningPositions } =
        getPositions(omnipoolId)
      const positionsAmount =
        omnipoolPositions.length + omnipoolMiningPositions.length
      const isPositions = positionsAmount > 0

      return {
        id: omnipoolId,
        meta,
        price,
        tvlDisplay,
        fee,
        isFeeLoading,
        isNative,
        isPositions,
        positionsAmount,
      }
    })

    return omnipoolData
  }, [
    omnipoolIds,
    getAssetWithFallback,
    getAssetPrice,
    tvls,
    fees,
    native.id,
    isFeeLoading,
    isLoading,
    getPositions,
  ])

  useEffect(() => {
    setOmnipoolAssets(data, isLoading)
  }, [data, isLoading])
}

export const useIsolatedPools = () => {
  const { data: pools = [], isLoading: isPoolsLoading } = useQuery(xykPools)
  const { getMetaFromXYKPoolTokens } = useAssets()
  const { getPositions } = useAccountPositions()

  const { ids: pricesIds, poolsData } = useMemo(() => {
    return pools.reduce<{
      ids: string[]
      poolsData: { spotPriceId: string; tvl: string; pool: PoolBase }[]
    }>(
      (acc, pool) => {
        const { tokens } = pool
        const cachedIds = acc.ids

        const knownAssetPrice =
          tokens.find((token) => cachedIds.includes(token.id)) ??
          tokens.find((token) => token.isSufficient) ??
          tokens[0]

        if (!knownAssetPrice) return acc

        const { balance, decimals, id } = knownAssetPrice

        const shiftedBalance = scaleHuman(balance, decimals)

        const tvl = Big(shiftedBalance).times(2).toString()

        acc.poolsData.push({
          spotPriceId: id,
          tvl,
          pool,
        })

        if (!cachedIds.includes(id)) {
          acc.ids.push(id)
        }

        return acc
      },
      { ids: [], poolsData: [] },
    )
  }, [pools])

  const { getAssetPrice, isLoading: isPriceLoading } = useAssetsPrice(pricesIds)

  const data = useMemo(() => {
    if (isPriceLoading) return []

    return poolsData.reduce<IsolatedPoolTable[]>(
      (acc, { pool, tvl, spotPriceId }) => {
        const price = getAssetPrice(spotPriceId).price
        const tvlDisplay = Big(tvl).times(price).toString()

        const meta = getMetaFromXYKPoolTokens(pool.tokens)
        const { xykMiningPositions } = getPositions(pool.address)

        if (!meta) return acc

        acc.push({
          id: pool.address,
          tokens: pool.tokens,
          meta,
          tvlDisplay,
          isPositions: xykMiningPositions.length > 0,
        })

        return acc
      },
      [],
    )
  }, [
    poolsData,
    getAssetPrice,
    getMetaFromXYKPoolTokens,
    isPriceLoading,
    getPositions,
  ])

  const isLoading = isPriceLoading || isPoolsLoading

  useEffect(() => {
    setXYKPools(data, isLoading)
  }, [data, isLoading])
}

export const useIsolatedPoolsColumns = () => {
  const { t } = useTranslation()

  return useMemo(
    () => [
      isolatedColumnHelper.accessor("meta.name", {
        header: "Pool asset",
        cell: ({ row }) => {
          const { meta } = row.original

          return (
            <AssetLabelXYK
              iconIds={meta?.iconId ?? []}
              symbol={meta?.symbol ?? ""}
            />
          )
        },
      }),
      isolatedColumnHelper.accessor("tvlDisplay", {
        header: "Total value locked",
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
    ],
    [t],
  )
}

export const usePoolColumns = () => {
  const { t } = useTranslation()

  const { navigate } = useRouter()

  return useMemo(
    () => [
      columnHelper.accessor("meta.name", {
        header: "Pool asset",
        cell: ({ row }) => (
          <AssetLabelFull
            asset={row.original.meta}
            withName={isStableSwap(row.original.meta)}
          />
        ),
        sortingFn: (a, b) =>
          a.original.meta.symbol.localeCompare(b.original.meta.symbol),
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: ({ row }) => <AssetPrice assetId={row.original.id} />,
        sortingFn: (a, b) =>
          new Big(a.original.price).gt(b.original.price) ? 1 : -1,
      }),
      columnHelper.accessor("tvlDisplay", {
        header: "Total value locked",
        cell: ({ row }) =>
          t("currency", {
            value: Number(row.original.tvlDisplay),
          }),
        sortingFn: (a, b) =>
          new Big(a.original.tvlDisplay).gt(b.original.tvlDisplay) ? 1 : -1,
      }),
      columnHelper.display({
        header: "Fee",

        cell: ({ row }) =>
          t("percent", {
            value: Number(row.original.fee),
          }),
      }),
      columnHelper.accessor("id", {
        meta: { visibility: false },
        sortingFn: (a, b) => {
          if (a.original.isNative) return 1
          if (b.original.isNative) return -1

          return new Big(a.original.tvlDisplay).gt(b.original.tvlDisplay)
            ? 1
            : -1
        },
      }),
      columnHelper.accessor("id", {
        meta: { visibility: false },
        sortingFn: (a, b) => {
          if (a.original.isNative) return 1
          if (b.original.isNative) return -1

          return new Big(a.original.tvlDisplay).gt(b.original.tvlDisplay)
            ? 1
            : -1
        },
      }),
      columnHelper.accessor("meta.symbol", {
        meta: { visibility: false },
      }),
      columnHelper.display({
        id: "actions",
        meta: {
          sx: {
            width: "200px",
          },
        },
        cell: ({ row }) => (
          <Flex
            gap={getTokenPx("containers.paddings.quint")}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="accent"
              outline
              onClick={() =>
                navigate({
                  from: "/liquidity",
                  to: "/liquidity/$id/add",
                  params: { id: row.original.id },
                  resetScroll: false,
                })
              }
            >
              Join pool
            </Button>
            <Button
              variant="tertiary"
              outline
              onClick={() =>
                navigate({
                  to: "/liquidity/$id",
                  params: { id: row.original.id },
                  resetScroll: false,
                })
              }
            >
              Details
            </Button>
          </Flex>
        ),
      }),
    ],

    [navigate, t],
  )
}

export const isIsolatedPool = (
  pool: OmnipoolAssetTable | IsolatedPoolTable,
): pool is IsolatedPoolTable => {
  return "tokens" in pool
}

export const useOmnipoolCapacity = (id: string) => {
  const {
    dataMap: omnipoolAssets,
    hubToken,
    isLoading,
  } = useOmnipoolAssetsData()

  const data = useMemo(() => {
    if (!omnipoolAssets || !hubToken) return null

    const asset = omnipoolAssets.get(id)

    if (!asset || !hubToken) return null

    const symbol = asset.symbol
    const assetReserve = asset.balance
    const assetHubReserve = asset.hubReserve
    const assetCap = asset.cap
    const totalHubReserve = hubToken.balance

    const capDifference = OmniMath.calculateCapDifference(
      assetReserve,
      assetHubReserve,
      assetCap,
      totalHubReserve,
    )

    if (capDifference === "-1") return null

    const capacity = scaleHuman(
      Big(asset.balance).plus(capDifference).toString(),
      asset.decimals,
    )
    const filled = scaleHuman(asset.balance, asset.decimals)
    const filledPercent = Big(filled).div(capacity).times(100).toString()

    return { capacity, filled, filledPercent, symbol }
  }, [hubToken, id, omnipoolAssets])

  return { data, isLoading }
}
