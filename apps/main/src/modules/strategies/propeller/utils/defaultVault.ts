import { type PropellerDepositOption } from "@/modules/strategies/propeller/utils/depositOptions"

/**
 * Deposit option to preselect: the option paying with `assetParam` (registry
 * symbol, case-insensitive); else, among the options of the vault whose share
 * symbol is `assetParam` (or all options), the one with the highest wallet USD
 * value (ties in config order); else the first of those options.
 */
export const selectDefaultDeposit = (
  options: ReadonlyArray<PropellerDepositOption>,
  {
    assetParam,
    symbols,
    balancesUsd,
  }: {
    assetParam?: string
    /** Registry symbol per option assetId. */
    symbols: Record<string, string>
    /** Wallet transferable balance × spot price per option assetId. */
    balancesUsd: Record<string, number>
  },
): PropellerDepositOption | null => {
  const param = assetParam?.toLowerCase()
  const byAsset =
    param && options.find((o) => symbols[o.assetId]?.toLowerCase() === param)
  if (byAsset) return byAsset

  const byVault = param
    ? options.filter((o) => o.vault.shareSymbol.toLowerCase() === param)
    : []
  const candidates = byVault.length ? byVault : options

  const richest = candidates.reduce<PropellerDepositOption | null>(
    (best, o) => {
      const usd = balancesUsd[o.assetId] ?? 0
      const bestUsd = best ? (balancesUsd[best.assetId] ?? 0) : 0
      return usd > bestUsd ? o : best
    },
    null,
  )

  return richest ?? candidates[0] ?? null
}
