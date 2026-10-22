import type { EModeCategory, ReserveSummary } from "@/types"

/**
 * Every e-mode category the market offers, sorted by id. Category 0 is "no
 * e-mode" and is never returned. The label is the on-chain `eModeLabel`
 * verbatim; formatting it is the app's concern.
 */
export function eModeCategories(summaries: ReserveSummary[]): EModeCategory[] {
  const categories = new Map<number, EModeCategory>()

  for (const summary of summaries) {
    if (summary.eModeCategoryId === 0) continue

    const asset = {
      underlyingAsset: summary.underlyingAsset,
      symbol: summary.symbol,
    }
    const category = categories.get(summary.eModeCategoryId)
    if (category) {
      category.assets.push(asset)
      continue
    }

    categories.set(summary.eModeCategoryId, {
      id: summary.eModeCategoryId,
      label: summary.eModeLabel,
      ltv: summary.eModeLtv,
      liquidationThreshold: summary.eModeLiquidationThreshold,
      assets: [asset],
    })
  }

  return [...categories.values()].sort((a, b) => a.id - b.id)
}
