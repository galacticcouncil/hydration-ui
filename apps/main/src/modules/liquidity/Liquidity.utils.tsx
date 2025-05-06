import { OmniMath, PoolBase, PoolToken } from "@galacticcouncil/sdk"
import { Button, Flex } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "@tanstack/react-router"
import { createColumnHelper } from "@tanstack/table-core"
import Big from "big.js"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"

import { AssetType, TAssetData } from "@/api/assets"
import { useFee, useOmnipoolAssetsData, useTVL } from "@/api/omnipool"
import { stablePools, xykPools } from "@/api/pools"
import { AssetLabelFull, AssetLabelXYK, AssetPrice } from "@/components"
import {
  isStableSwap,
  useAssets,
  XYKPoolMeta,
} from "@/providers/assetsProvider"
import {
  Balance,
  useAccountBalances,
  useAccountPositions,
} from "@/states/account"
import { useAssetsPrice } from "@/states/displayAsset"
import {
  setOmnipoolAssets,
  setXYKPools,
  useOmnipoolIds,
} from "@/states/liquidity"
import { scaleHuman } from "@/utils/formatting"
import { toBig } from "@/utils/helpers"
import { numericallyStrDesc } from "@/utils/sort"

export type OmnipoolAssetTable = {
  id: string
  meta: TAssetData
  price: string | undefined
  tvlDisplay: string
  fee?: string
  isFeeLoading: boolean
  isNative: boolean
  isPositions: boolean
  positionsAmount: number
  isStablePool: boolean
  balance?: Balance
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

  const { getBalance } = useAccountBalances()
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
      const assetPrice = getAssetPrice(omnipoolId)
      const price = assetPrice.isValid
        ? Big(assetPrice.price).round(5).toString()
        : undefined

      const tvlDisplay =
        tvls
          ?.find((tvl) => tvl?.asset_id === Number(omnipoolId))
          ?.tvl_usd.toString() ?? "0"
      const fee = isNative
        ? undefined
        : fees
            ?.find((fee) => fee?.asset_id === Number(omnipoolId))
            ?.projected_apr_perc.toString()

      const { omnipoolPositions, omnipoolMiningPositions } =
        getPositions(omnipoolId)
      const positionsAmount =
        omnipoolPositions.length + omnipoolMiningPositions.length
      const balance = getBalance(omnipoolId)

      const isStablePool = isStableSwap(meta)
      const isPositions = positionsAmount > 0 || (!!balance && isStablePool)

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
        isStablePool,
        balance,
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
    getBalance,
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
        const tvlDisplay = toBig(price)?.times(tvl).toString() ?? "-"

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
  const { isMobile } = useBreakpoints()

  const { navigate } = useRouter()

  return useMemo(
    () => [
      columnHelper.accessor("meta.name", {
        header: "Pool asset",
        cell: ({ row }) => (
          <AssetLabelFull
            asset={row.original.meta}
            withName={isStableSwap(row.original.meta) && !isMobile}
          />
        ),
        sortingFn: (a, b) =>
          a.original.meta.symbol.localeCompare(b.original.meta.symbol),
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: ({ row }) => <AssetPrice assetId={row.original.id} />,
        sortingFn: (a, b) =>
          new Big(a.original.price ?? 0).gt(b.original.price ?? 0) ? 1 : -1,
      }),
      columnHelper.accessor("tvlDisplay", {
        header: "Total value locked",
        cell: ({ row }) =>
          t("currency", {
            value: Number(row.original.tvlDisplay),
          }),
        sortingFn: (a, b) =>
          numericallyStrDesc(b.original.tvlDisplay, a.original.tvlDisplay),
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

          return numericallyStrDesc(
            b.original.tvlDisplay,
            a.original.tvlDisplay,
          )
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

    [navigate, t, isMobile],
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

export const useStablepoolReserves = (stablepoolId?: string) => {
  const { getAssetWithFallback } = useAssets()
  const { data: pools = [], isLoading: isPoolsLoading } = useQuery(stablePools)

  const stablepoolAssets = useMemo(
    () =>
      pools
        .find((stablePool) => stablePool.id === stablepoolId)
        ?.tokens.filter(
          (token) =>
            token.type === AssetType.TOKEN || token.type === AssetType.ERC20,
        ) ?? [],
    [pools, stablepoolId],
  )

  const assetIds = stablepoolAssets.map((asset) => asset.id)

  const { getAssetPrice, isLoading: isAssetsLoading } = useAssetsPrice(assetIds)

  const reserves = useMemo(
    () =>
      stablepoolAssets.map((token) => {
        const id = token.id
        const meta = getAssetWithFallback(id)

        const amountHuman = scaleHuman(token.balance, meta.decimals)
        const assetPrice = getAssetPrice(id)

        return {
          asset_id: Number(id),
          meta,
          amount: token.balance,
          amountHuman,
          displayAmount: assetPrice.isValid
            ? toBig(assetPrice.price)?.times(amountHuman).toString()
            : undefined,
        }
      }),
    [stablepoolAssets, getAssetWithFallback, getAssetPrice],
  )

  const totalDisplayAmount = reserves.reduce(
    (t, asset) =>
      Big(t)
        .plus(asset.displayAmount ?? 0)
        .toString(),
    "0",
  )

  return {
    reserves,
    totalDisplayAmount,
    isLoading: isPoolsLoading || isAssetsLoading,
  }
}
