import {
  BIL_ERC20_ID,
  HOLLAR_ASSET_ID,
  SELL_ONLY_ASSETS,
  USDC_ASSET_ID,
  USDT_ASSET_ID,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueries, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import { useBondData } from "@/api/bonds"
import { neckworkClient } from "@/api/provider"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import {
  useIsolatedPools,
  useOmnipoolStablepools,
} from "@/modules/liquidity/Liquidity.utils"
import { useWalletBalancesSectionData } from "@/modules/portfolio/overview/Balances/WalletBalances.data"
import { useMyAssetsTableData } from "@/modules/portfolio/overview/MyAssets/MyAssetsTable.data"
import { useWalletRewardsSectionData } from "@/modules/portfolio/overview/Rewards/WalletRewardsSection.data"
import { useBilStrategyMetrics } from "@/modules/strategies/bil/hooks/useBilStrategyMetrics"
import { STABLE_BONDS } from "@/modules/strategies/stable-bonds/config/bonds"
import { useStableBonds } from "@/modules/strategies/stable-bonds/hooks/useStableBonds"
import {
  isStableBondSoldOut,
  useStableBondsOtcOrders,
} from "@/modules/strategies/stable-bonds/hooks/useStableBondsOtcOrders"
import {
  getBondApr,
  getDefaultBondApr,
} from "@/modules/strategies/stable-bonds/utils/apr"
import { useRoutedTradesData } from "@/modules/trade/orders/lib/useRoutedTradesData"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useDisplayAssetStore } from "@/states/displayAsset"

export type DashboardOpportunityKind = "strategy" | "liquidity"

export type DashboardOpportunity = {
  id: string
  kind: DashboardOpportunityKind
  title: string
  description: string
  source: string
  rate: string | null
  logoIds: string | string[]
  matchingAssetIds: string[]
  isMatched: boolean
  isLoading: boolean
  destination:
    | { type: "bil" }
    | { type: "bonds"; bondId: string }
    | {
        type: "liquidity"
        poolId: string
        stableswapId?: string
        erc20Id?: string
      }
}

export type DashboardMarketMover = {
  assetId: string
  symbol: string
  name: string
  price: string | null
  weeklyChange: number | null
}

const MARKET_MOVER_CANDIDATE_LIMIT = 8
const MARKET_MOVER_LIMIT = 5
const MARKET_MOVER_BUCKET_MS = 4 * 60 * 60_000
const MARKET_MOVER_LOOKBACK_MS = 7 * 24 * 60 * 60_000
const MARKET_MOVER_EXCLUDED_IDS = new Set([
  HOLLAR_ASSET_ID,
  USDT_ASSET_ID,
  USDC_ASSET_ID,
  ...SELL_ONLY_ASSETS,
])

const toRate = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === "") return null

  const number = Number(value)
  return Number.isFinite(number) && number > 0 ? number.toString() : null
}

export const useDashboardData = () => {
  const { account } = useAccount()
  const { featureFlags } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const stableCoinId = useDisplayAssetStore((state) => state.stableCoinId)

  const wallet = useWalletBalancesSectionData()
  const rewards = useWalletRewardsSectionData()
  const [, { price: referralRewardsUsd, isLoading: referralPriceLoading }] =
    useDisplayAssetPrice(rewards.referral.assetId, rewards.referral.value)
  const assets = useMyAssetsTableData(true)
  const { swaps, isLoading: isActivityLoading } = useRoutedTradesData(
    account?.publicKey ?? "",
    [],
    0,
    4,
  )

  const { data: omnipool, isLoading: isOmnipoolLoading } =
    useOmnipoolStablepools(false)
  const { data: isolatedPools, isLoading: isIsolatedLoading } =
    useIsolatedPools(false)

  const marketAssetIds = useMemo(() => {
    const rankedAssetIds = (omnipool ?? [])
      .filter(
        (pool) =>
          !pool.isStablePool &&
          /^\d+$/.test(pool.meta.id) &&
          !MARKET_MOVER_EXCLUDED_IDS.has(pool.meta.id),
      )
      .toSorted((a, b) => Big(b.tvlDisplay ?? 0).cmp(a.tvlDisplay ?? 0))
      .map((pool) => pool.meta.id)

    return Array.from(new Set(rankedAssetIds)).slice(
      0,
      MARKET_MOVER_CANDIDATE_LIMIT,
    )
  }, [omnipool])

  const marketPriceQueries = useQueries({
    queries: marketAssetIds.map((assetId) => {
      const isFetchAligned = Number(stableCoinId) >= Number(assetId)
      const assetIn = isFetchAligned ? assetId : (stableCoinId ?? assetId)
      const assetOut = isFetchAligned ? (stableCoinId ?? assetId) : assetId

      return {
        queryKey: ["dashboard", "market-mover", assetIn, assetOut, "7d"],
        staleTime: MARKET_MOVER_BUCKET_MS,
        enabled: !!stableCoinId && assetId !== stableCoinId,
        queryFn: async (): Promise<{
          price: string
          weeklyChange: number
        } | null> => {
          const now = Date.now()
          const cutoff =
            Math.floor(
              (now - MARKET_MOVER_LOOKBACK_MS) / MARKET_MOVER_BUCKET_MS,
            ) * MARKET_MOVER_BUCKET_MS
          const response = await neckworkClient.GET("/v1/prices/pair", {
            params: {
              query: {
                assetIn,
                assetOut,
                bucket: "4h",
                from: new Date(cutoff).toISOString(),
                to: new Date(now).toISOString(),
              },
            },
          })
          const data = response.data as
            | { items: readonly { close: string | number }[] }
            | undefined
          const first = data?.items.at(0)?.close
          const latest = data?.items.at(-1)?.close

          if (first === undefined || latest === undefined) return null

          const normalize = (value: string | number) => {
            const price = Big(value)
            return isFetchAligned ? price : Big(1).div(price)
          }
          const referencePrice = normalize(first)
          const currentPrice = normalize(latest)

          if (referencePrice.lte(0) || currentPrice.lte(0)) return null

          return {
            price: currentPrice.toString(),
            weeklyChange: currentPrice
              .div(referencePrice)
              .minus(1)
              .times(100)
              .toNumber(),
          }
        },
      }
    }),
  })

  const platformStatsQueryResult = useQuery({
    queryKey: ["dashboard", "platform-stats"],
    staleTime: 5 * 60_000,
    queryFn: async (): Promise<{
      totalLiquidity: string
      volume24h: string
    }> => {
      const response = await neckworkClient.GET("/v1/stats/platform")
      const data = response.data as
        | {
            tvl: { totalUsd: string | number }
            volume24h: {
              omnipoolUsd: string | number
              stableswapUsd: string | number
              xykUsd: string | number
            }
          }
        | undefined

      if (!data) throw new Error("Platform stats are not available")

      return {
        totalLiquidity: Big(data.tvl.totalUsd).toString(),
        volume24h: Big(data.volume24h.omnipoolUsd)
          .plus(data.volume24h.stableswapUsd)
          .plus(data.volume24h.xykUsd)
          .toString(),
      }
    },
  })

  const marketMovers: DashboardMarketMover[] = marketAssetIds
    .map((assetId, index) => {
      const asset = getAssetWithFallback(assetId)
      const snapshot = marketPriceQueries[index]?.data

      return {
        assetId,
        symbol: asset.symbol,
        name: asset.name,
        price: snapshot?.price ?? null,
        weeklyChange: snapshot?.weeklyChange ?? null,
      }
    })
    .toSorted((a, b) => {
      if (a.weeklyChange === null) return 1
      if (b.weeklyChange === null) return -1
      return Math.abs(b.weeklyChange) - Math.abs(a.weeklyChange)
    })
    .slice(0, MARKET_MOVER_LIMIT)

  const {
    data: bilMetrics,
    isError: isBilMetricsError,
    isLoading: isBilMetricsLoading,
  } = useBilStrategyMetrics()
  const { active } = useStableBonds()
  const bondId = active?.id ?? ""
  const bondConfig = STABLE_BONDS[bondId]
  const { timeLeft } = useBondData(bondId)
  const { data: bondOrders, isReady: areBondOrdersReady } =
    useStableBondsOtcOrders(
      bondId,
      bondConfig?.otcAcceptedAssetIds ?? [],
      bondConfig?.otcOfferIds ?? [],
    )
  const isBondSoldOut = isStableBondSoldOut(bondOrders, areBondOrdersReady)
  const bondApr = isBondSoldOut
    ? getDefaultBondApr(bondId)
    : getBondApr(bondId, timeLeft)

  const topAssets = useMemo(
    () =>
      assets.data
        .filter((asset) => Big(asset.total).gt(0))
        .toSorted((a, b) =>
          Big(b.totalDisplay ?? 0).cmp(Big(a.totalDisplay ?? 0)),
        ),
    [assets.data],
  )

  const ownedAssetIds = useMemo(
    () => new Set(assets.data.map((asset) => asset.id)),
    [assets.data],
  )

  const opportunities = useMemo(() => {
    const matchesWallet = (assetIds: string[]) =>
      !!account && assetIds.some((assetId) => ownedAssetIds.has(assetId))

    const strategyOpportunities: DashboardOpportunity[] = []

    if (featureFlags.bilEnabled) {
      strategyOpportunities.push({
        id: "strategy-bil",
        kind: "strategy",
        title: "Brazilian Invoice Loans",
        description:
          "Deposit HOLLAR into a diversified real-world credit vault.",
        source: "Strategy",
        rate: isBilMetricsError ? null : toRate(bilMetrics.maxNetApyPct),
        logoIds: BIL_ERC20_ID,
        matchingAssetIds: [HOLLAR_ASSET_ID],
        isMatched: matchesWallet([HOLLAR_ASSET_ID]),
        isLoading: isBilMetricsLoading,
        destination: { type: "bil" },
      })
    }

    if (featureFlags.hollarBondsEnabled) {
      const acceptedAssetIds = bondConfig?.otcAcceptedAssetIds ?? []
      strategyOpportunities.push({
        id: "strategy-hollar-bonds",
        kind: "strategy",
        title: "HOLLAR Bonds",
        description:
          "Lock supported stablecoins for a fixed return at maturity.",
        source: isBondSoldOut ? "Fixed yield · Sold out" : "Fixed yield",
        rate: toRate(bondApr),
        logoIds: bondId || HOLLAR_ASSET_ID,
        matchingAssetIds: acceptedAssetIds,
        isMatched: matchesWallet(acceptedAssetIds),
        isLoading: !areBondOrdersReady,
        destination: { type: "bonds", bondId },
      })
    }

    const omnipoolOpportunities: DashboardOpportunity[] = (omnipool ?? [])
      .filter(
        (pool) =>
          pool.meta.symbol.toUpperCase() !== "GLMR" &&
          pool.canAddLiquidity &&
          toRate(pool.totalFee),
      )
      .map((pool) => {
        const stablepoolData = pool.stablepoolData
        const matchingAssetIds = Array.from(
          new Set([
            pool.id,
            ...(stablepoolData?.reserves.map((reserve) =>
              reserve.asset_id.toString(),
            ) ?? []),
          ]),
        )

        return {
          id: `liquidity-${pool.id}`,
          kind: "liquidity",
          title: `${pool.meta.symbol} liquidity`,
          description: pool.isFarms
            ? "Earn pool fees and active farm incentives."
            : "Earn a share of fees generated by pool activity.",
          source: pool.isStablePool ? "Stablepool" : "Omnipool",
          rate: toRate(pool.totalFee),
          logoIds: pool.meta.id,
          matchingAssetIds,
          isMatched: matchesWallet(matchingAssetIds),
          isLoading: pool.isFeeLoading,
          destination: {
            type: "liquidity",
            poolId: pool.id,
            stableswapId: stablepoolData?.id.toString(),
            erc20Id: stablepoolData?.aToken?.id.toString(),
          },
        }
      })

    const isolatedOpportunities: DashboardOpportunity[] = (isolatedPools ?? [])
      .filter((pool) => pool.canAddLiquidity && toRate(pool.totalApr))
      .map((pool) => {
        const matchingAssetIds = pool.tokens.map((token) => token.id.toString())
        const tokenAssets = matchingAssetIds.map(getAssetWithFallback)
        return {
          id: `liquidity-${pool.id}`,
          kind: "liquidity",
          title: tokenAssets.map((token) => token.symbol).join(" / "),
          description:
            "Provide both pool assets and earn active farm incentives.",
          source: "Isolated pool",
          rate: toRate(pool.totalApr),
          logoIds: pool.tokens.map((token) => token.id.toString()),
          matchingAssetIds,
          isMatched: matchesWallet(matchingAssetIds),
          isLoading: pool.isFeeLoading,
          destination: { type: "liquidity", poolId: pool.id },
        }
      })

    return [
      ...strategyOpportunities,
      ...omnipoolOpportunities,
      ...isolatedOpportunities,
    ].toSorted((a, b) => {
      if (a.isMatched !== b.isMatched) return a.isMatched ? -1 : 1
      return Big(b.rate ?? 0).cmp(Big(a.rate ?? 0))
    })
  }, [
    account,
    areBondOrdersReady,
    bilMetrics.maxNetApyPct,
    bondApr,
    bondConfig?.otcAcceptedAssetIds,
    bondId,
    featureFlags.bilEnabled,
    featureFlags.hollarBondsEnabled,
    getAssetWithFallback,
    isBilMetricsLoading,
    isBilMetricsError,
    isBondSoldOut,
    isolatedPools,
    omnipool,
    ownedAssetIds,
  ])

  const isWalletLoading =
    wallet.isAssetsLoading ||
    wallet.isLiquidityLoading ||
    wallet.isBorrowLoading

  const netWorth = Big(wallet.assets || 0)
    .plus(wallet.liquidity || 0)
    .minus(wallet.borrow || 0)
    .toString()

  const claimableRewards = Big(rewards.incentives.value || 0)
    .plus(rewards.farming.value || 0)
    .plus(referralRewardsUsd || 0)
    .toString()

  const platformStatsData = platformStatsQueryResult.data

  return {
    account,
    wallet,
    netWorth,
    claimableRewards,
    isRewardsLoading: rewards.isLoading || referralPriceLoading,
    isWalletLoading,
    topAssets,
    walletAssets: assets.data,
    isAssetsLoading: assets.isLoading,
    recentActivity: swaps,
    isActivityLoading,
    marketMovers,
    isMarketMoversLoading:
      !marketMovers.some((mover) => mover.weeklyChange !== null) &&
      marketPriceQueries.some((query) => query.isLoading),
    platformStats: {
      totalLiquidity: platformStatsData?.totalLiquidity ?? null,
      volume24h: platformStatsData?.volume24h ?? null,
      earningOptions: opportunities.length,
    },
    isPlatformStatsLoading: platformStatsQueryResult.isLoading,
    opportunities,
    isOpportunitiesLoading:
      isOmnipoolLoading ||
      !!isIsolatedLoading ||
      (featureFlags.bilEnabled && isBilMetricsLoading),
  }
}
