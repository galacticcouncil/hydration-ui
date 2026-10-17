import { stablepoolYieldMetricsQuery } from "@galacticcouncil/indexer/neckwork"
import { markets } from "@galacticcouncil/money-market-v2/core"
import { useReserveSummaries } from "@galacticcouncil/money-market-v2/react"
import type { ReserveSummary } from "@galacticcouncil/money-market-v2/types"
import {
  BIL_ASSET_ID,
  EXTERNAL_APY_ASSET_IDS,
  getAddressFromAssetId,
  getAssetIdFromAddress,
  useStableArray,
} from "@galacticcouncil/utils"
import { useQueries, useQuery } from "@tanstack/react-query"
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import { isDeepEqual } from "remeda"
import { Address } from "viem"

import { defillamaLatestApyQuery } from "@/api/external/defillama"
import { kaminoApyQuery } from "@/api/external/kamino"
import { lpFeeReading } from "@/api/external/lpFee"
import { readingStatus } from "@/api/external/reading"
import { neckworkClient, PROXY_URL } from "@/api/neckwork"
import { useStablepoolsReserves } from "@/modules/liquidity/Liquidity.utils"
import {
  AdjustedReserve,
  gatherAdjustedApys,
  HydrationSupplyApys,
  vaultAprReading,
} from "@/modules/money-market-v2/adjustedApys"
import {
  ConstituentFeed,
  FeedSource,
  feedSource,
  poolProportion,
} from "@/modules/money-market-v2/constituents"
import {
  AdjustedApys,
  ReserveApy,
  reserveApy,
} from "@/modules/money-market-v2/effectiveApy"
import { useVaultStats } from "@/modules/strategies/bil/hooks/useVaultReads"
import { isStableSwap, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

const NO_ADJUSTED_APYS: AdjustedApys = new Map()

const AdjustedApysContext = createContext<AdjustedApys>(NO_ADJUSTED_APYS)

const feedQuery = ({ source, id }: FeedSource) =>
  source === "defillama"
    ? defillamaLatestApyQuery(id, PROXY_URL)
    : kaminoApyQuery(id, PROXY_URL)

/**
 * Keeps the previous value while the next one is structurally the same. The
 * map is rebuilt on every tick of the reserve summaries; handing out the same
 * object until a rate actually changes is what keeps the surfaces reading it
 * from re-rendering each second.
 */
const useDeepStable = <T,>(value: T): T => {
  const [stable, setStable] = useState(value)

  if (stable === value || isDeepEqual(stable, value)) return stable

  setStable(value)
  return value
}

/**
 * Gathers every read an adjusted reserve's effective APY is composed from and
 * composes them once for the whole module. Adjusted reserves are configured by
 * asset id; this is the one place those ids meet reserve addresses.
 */
const AdjustedApysProvider: FC<PropsWithChildren> = ({ children }) => {
  const { getAsset, getErc20AToken } = useAssets()

  const selected = useReserveSummaries()
  const hydration = useReserveSummaries(markets.hydration_v3)

  const adjustedAssetIds = useMemo(
    () =>
      new Map(
        [...EXTERNAL_APY_ASSET_IDS, BIL_ASSET_ID].map((assetId) => [
          getAddressFromAssetId(assetId).toLowerCase(),
          assetId,
        ]),
      ),
    [],
  )

  const listed = (selected.data ?? []).flatMap((reserve) => {
    const address = reserve.underlyingAsset.toLowerCase() as Address
    const assetId = adjustedAssetIds.get(address)

    if (!assetId) return []

    const asset = getAsset(assetId)
    const poolAssetIds =
      asset && isStableSwap(asset) ? (asset.underlyingAssetId ?? []) : undefined

    return [{ assetId, address, reserve, poolAssetIds }]
  })

  const poolIds = useStableArray(
    listed.flatMap(({ assetId, poolAssetIds }) =>
      poolAssetIds ? [assetId] : [],
    ),
  )

  const feedAssetIds = useStableArray([
    ...new Set(
      listed
        .flatMap(({ assetId, poolAssetIds }) => poolAssetIds ?? [assetId])
        .filter((assetId) => !!feedSource(assetId)),
    ),
  ])

  const feedResults = useQueries({
    queries: feedAssetIds.flatMap((assetId) => {
      const source = feedSource(assetId)
      return source ? [feedQuery(source)] : []
    }),
  })

  const yieldMetrics = useQuery({
    ...stablepoolYieldMetricsQuery(neckworkClient),
    enabled: poolIds.length > 0,
  })

  const { data: pools, isLoading: poolsLoading } =
    useStablepoolsReserves(poolIds)

  const vault = vaultAprReading(useVaultStats())

  const { data: yieldMetricsData, isPending: isYieldMetricsPending } =
    yieldMetrics

  // memoised: an implausible LP fee is logged on every read
  const lpFees = useMemo(() => {
    const now = Date.now()

    return new Map(
      poolIds.map((poolId) => [
        poolId,
        lpFeeReading(
          { data: yieldMetricsData, isPending: isYieldMetricsPending },
          poolId,
          now,
        ),
      ]),
    )
  }, [poolIds, yieldMetricsData, isYieldMetricsPending])

  const now = Date.now()

  const feeds = new Map(
    feedAssetIds.flatMap((assetId, index): [string, ConstituentFeed][] => {
      const source = feedSource(assetId)
      const result = feedResults[index]

      return source && result
        ? [
            [
              assetId,
              { kind: source.kind, reading: readingStatus(result, now) },
            ],
          ]
        : []
    }),
  )

  const hydrationSupplyApys: HydrationSupplyApys = hydration.data
    ? {
        status: "known",
        apys: new Map(
          hydration.data.map(({ underlyingAsset, supplyApy }) => [
            getAssetIdFromAddress(underlyingAsset),
            supplyApy,
          ]),
        ),
      }
    : { status: hydration.isPending ? "loading" : "unavailable" }

  const reserves = listed.map(
    ({ assetId, address, reserve, poolAssetIds }): AdjustedReserve => {
      const pool = pools.find(({ pool }) => pool.id.toString() === assetId)

      return {
        assetId,
        address,
        reserve,
        // from the registry's list, not the pool's reserves: a pool asset the
        // pool read skipped must come out with no proportion, not be dropped
        poolAssets: poolAssetIds?.map((poolAssetId) => ({
          assetId: poolAssetId,
          underlyingAssetId: getErc20AToken(poolAssetId)?.underlyingAssetId,
          proportion: poolProportion(poolAssetId, pool),
        })),
        lpFee: poolAssetIds && lpFees.get(assetId),
        vault: assetId === BIL_ASSET_ID ? vault : undefined,
      }
    },
  )

  const adjusted = useDeepStable(
    gatherAdjustedApys({ reserves, hydrationSupplyApys, poolsLoading, feeds }),
  )

  return (
    <AdjustedApysContext.Provider value={adjusted}>
      {children}
    </AdjustedApysContext.Provider>
  )
}

/**
 * Makes the effective APY of every reserve in the selected market readable
 * through `useReserveApy`. Must sit inside `MoneyMarketProvider`.
 *
 * Testnet is unadjusted: the gathering is not mounted there, so no feed,
 * yield-metrics or vault request is made and the map stays empty.
 */
export const ReserveApyProvider: FC<PropsWithChildren> = ({ children }) => {
  const { dataEnv } = useRpcProvider()

  if (dataEnv === "testnet") return children

  return <AdjustedApysProvider>{children}</AdjustedApysProvider>
}

type ReserveWithRates = Pick<
  ReserveSummary,
  | "underlyingAsset"
  | "supplyApy"
  | "variableBorrowApy"
  | "borrowingEnabled"
  | "supplyIncentives"
>

/**
 * `useReserveApy` for a list of reserves, where a hook per reserve cannot be
 * called. The resolver keeps its identity until a rate really changes.
 */
export const useResolveReserveApy = () => {
  const adjusted = useContext(AdjustedApysContext)

  return useCallback(
    (reserve: ReserveWithRates): ReserveApy =>
      reserveApy(
        reserve,
        adjusted.get(reserve.underlyingAsset.toLowerCase() as Address),
      ),
    [adjusted],
  )
}

/** The one way a surface reads a reserve's effective APY. */
export const useReserveApy = (reserve: ReserveWithRates): ReserveApy =>
  useResolveReserveApy()(reserve)
