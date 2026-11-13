export type RankableLoop = {
  collateralAssetId: string
  maxNetApy: number | null
  unavailable: boolean
  reason?: string | null
}

const byApy = (a: RankableLoop, b: RankableLoop) =>
  (b.maxNetApy ?? -Infinity) - (a.maxNetApy ?? -Infinity)

/** The wizard's borrow step: available loops by max net APY, unavailable ones last. */
export const sortDebtLoops = <T extends RankableLoop>(loops: T[]) =>
  [...loops].sort(
    (a, b) => Number(a.unavailable) - Number(b.unavailable) || byApy(a, b),
  )

// The reason most of a collateral's loops are blocked by; collateral-side
// limits (no withdrawable liquidity, supply cap) block every loop alike.
const commonReason = (loops: RankableLoop[]) => {
  const counts = new Map<string, number>()
  for (const { reason } of loops)
    if (reason) counts.set(reason, (counts.get(reason) ?? 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

/**
 * One row per collateral for the wizard's first step: its best APY, how many
 * loops it can open and, with none, why; collaterals with no valid loop last.
 */
export const summarizeCollaterals = <T extends RankableLoop>(loops: T[]) => {
  const byCollateral = new Map<string, T[]>()
  for (const loop of loops) {
    const list = byCollateral.get(loop.collateralAssetId) ?? []
    list.push(loop)
    byCollateral.set(loop.collateralAssetId, list)
  }

  return [...byCollateral.entries()]
    .map(([collateralAssetId, list]) => {
      const valid = list.filter((l) => !l.unavailable).sort(byApy)
      const best = valid[0] ?? null
      return {
        collateralAssetId,
        valid,
        best,
        reason: best ? null : commonReason(list),
      }
    })
    .sort(
      (a, b) =>
        Number(!a.best) - Number(!b.best) ||
        (b.best?.maxNetApy ?? -Infinity) - (a.best?.maxNetApy ?? -Infinity),
    )
}

/** Swap loss in bps against oracle values; negative when the swap beats the oracle. */
export const getSwapLossBps = (inValue: number, outValue: number) =>
  inValue > 0 ? (1 - outValue / inValue) * 10_000 : Infinity

export type FillProbe = {
  usd: number
  rampLossBps: number
  unwindLossBps: number
}

/**
 * The largest probed rung size that fills both ways within the margin, with
 * every smaller size filling too; 0 when even the smallest fails one way.
 * `unwindFills` is false when the unwind fails at the smallest size.
 */
export const getFillsUpTo = (probes: FillProbe[], marginBps: number) => {
  const sorted = [...probes].sort((a, b) => a.usd - b.usd)
  let fillsUpTo = 0
  for (const p of sorted) {
    if (p.rampLossBps > marginBps || p.unwindLossBps > marginBps) break
    fillsUpTo = p.usd
  }
  const smallest = sorted[0]
  return {
    fillsUpTo,
    unwindFills: !smallest || smallest.unwindLossBps <= marginBps,
  }
}

/** How far below the swap's slippage a quote has to stay to count as filling. */
export const FILL_MARGIN_BPS = 25

type LoopPair = { slug: string; collateralAssetId: string; debtAssetId: string }

/**
 * Custom loops the user holds a position on but that aren't in the list
 * (opened on another device, or removed), so they can be put back.
 */
export const getLoopsToRestore = (
  positionPairs: LoopPair[],
  listed: LoopPair[],
  isCustom: (pair: LoopPair) => boolean,
) => {
  const seen = new Set(
    listed.map((p) => `${p.collateralAssetId}-${p.debtAssetId}`),
  )
  return positionPairs.flatMap((p) => {
    const key = `${p.collateralAssetId}-${p.debtAssetId}`
    if (!isCustom(p) || seen.has(key)) return []
    seen.add(key)
    return [
      { collateralAssetId: p.collateralAssetId, debtAssetId: p.debtAssetId },
    ]
  })
}

/** A loop can only be removed from the list while no position is open on it. */
export const canRemoveLoop = (slug: string, positionSlugs: string[]) =>
  !positionSlugs.includes(slug)
