import Big from "big.js"

import { ASSET_ID_TO_DEFILLAMA_ID } from "@/api/external/defillama"
import { ASSET_ID_TO_KAMINO_ID } from "@/api/external/kamino"
import type { ExternalApyReadingStatus } from "@/api/external/reading"
import type { ApyConstituent } from "@/modules/money-market-v2/effectiveApy"

export type FeedKind = NonNullable<ApyConstituent["feed"]>["kind"]

/** Which feed an asset reads, from configuration alone. */
export type FeedSource = {
  source: "defillama" | "kamino"
  /** The feed's own id for the asset, not an asset id. */
  id: string
  kind: FeedKind
}

/**
 * The feed configured for an asset id, if any. A DefiLlama feed is a staking
 * yield and a Kamino feed a native yield; DefiLlama is looked up first, as in
 * legacy `useExternalApys`.
 */
export const feedSource = (assetId: string): FeedSource | undefined => {
  const defillamaId = ASSET_ID_TO_DEFILLAMA_ID[assetId]
  if (defillamaId)
    return { source: "defillama", id: defillamaId, kind: "stake" }

  const kaminoId = ASSET_ID_TO_KAMINO_ID[assetId]
  if (kaminoId) return { source: "kamino", id: kaminoId, kind: "nativeYield" }
}

/**
 * A pool asset's share of its stableswap pool by display value, as a fraction.
 * Missing when the pool, the asset's reserve or a positive total could not be
 * read: there is no equal split to fall back on (legacy guesses `1 / count`).
 */
export const poolProportion = (
  assetId: string,
  pool:
    | {
        reserves: ReadonlyArray<{
          asset_id: number | string
          displayAmount: string
        }>
        totalDisplayAmount: string
      }
    | undefined,
): string | undefined => {
  const reserve = pool?.reserves.find(
    ({ asset_id }) => asset_id.toString() === assetId,
  )

  if (!pool || !reserve || !Big(pool.totalDisplayAmount).gt(0)) return

  return Big(reserve.displayAmount).div(pool.totalDisplayAmount).toFixed()
}

/** One asset held by a stableswap pool whose share is an adjusted reserve. */
export type PoolAsset = {
  assetId: string
  /**
   * The asset the pool asset's aToken wraps (`getErc20AToken`), which is the
   * one listed as a reserve. Absent when the pool asset is not an aToken.
   */
  underlyingAssetId?: string
  /** Share of the pool, as a fraction. Missing when pool data is. */
  proportion?: string
}

export type ConstituentFeed = {
  kind: FeedKind
  reading: ExternalApyReadingStatus
}

export type ResolveConstituentsInput = {
  /** The adjusted reserve's asset id. */
  assetId: string
  /** The reserve's own base supply APY in the selected market. */
  supplyApy: string
  /** The pool's assets when the reserve is a stableswap share, else absent. */
  poolAssets?: ReadonlyArray<PoolAsset>
  /** Base supply APY of every `hydration_v3` reserve, by asset id. */
  hydrationSupplyApys: ReadonlyMap<string, string>
  /** The reading of every configured feed, by the asset id it is for. */
  feeds: ReadonlyMap<string, ConstituentFeed>
}

export type ResolvedConstituents = {
  constituents: ApyConstituent[]
  /** A feed of this reserve is on its first fetch: do not compose yet. */
  loading: boolean
}

const toFeed = (feed: ConstituentFeed | undefined): ApyConstituent["feed"] =>
  feed && {
    kind: feed.kind,
    apy: feed.reading.status === "known" ? feed.reading.reading.apy : null,
  }

/**
 * Turns one adjusted reserve's registry, pool and feed data into the
 * `constituents` of `adjustedApy`, following the supply side of legacy
 * `useBorrowAssetsApy` / `calculateAssetApyTotals`.
 *
 * A plain asset is its own single constituent: proportion 1, its own base
 * supply APY in the selected market, and its feed when one is configured. A
 * stableswap share has one constituent per pool asset: that asset's proportion
 * in the pool, the base supply APY of its matching `hydration_v3` reserve
 * (the aToken's underlying; none when nothing matches) and a feed matched by
 * the pool asset's own id.
 *
 * A missing proportion stays missing and an unavailable feed becomes
 * `apy: null`, so `adjustedApy` reports the rate unavailable. A loading feed
 * also carries `apy: null`: check `loading` before composing.
 */
export const resolveConstituents = ({
  assetId,
  supplyApy,
  poolAssets,
  hydrationSupplyApys,
  feeds,
}: ResolveConstituentsInput): ResolvedConstituents => {
  const feedAssetIds = poolAssets?.map((asset) => asset.assetId) ?? [assetId]

  const loading = feedAssetIds.some(
    (id) => feeds.get(id)?.reading.status === "loading",
  )

  if (!poolAssets) {
    return {
      constituents: [
        {
          assetId,
          proportion: "1",
          supplyApy,
          feed: toFeed(feeds.get(assetId)),
        },
      ],
      loading,
    }
  }

  return {
    constituents: poolAssets.map((asset) => ({
      assetId: asset.assetId,
      proportion: asset.proportion,
      supplyApy: hydrationSupplyApys.get(
        asset.underlyingAssetId ?? asset.assetId,
      ),
      feed: toFeed(feeds.get(asset.assetId)),
    })),
    loading,
  }
}
