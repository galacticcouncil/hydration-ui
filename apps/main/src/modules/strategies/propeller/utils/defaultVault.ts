import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"

/**
 * Deposit vault to preselect: the vault matching `assetParam` (registry
 * symbol, case-insensitive), else the one with the highest wallet USD value
 * (ties in config order), else the first configured vault.
 */
export const selectDefaultVault = (
  vaults: ReadonlyArray<PropellerVaultConfig>,
  {
    assetParam,
    symbols,
    balancesUsd,
  }: {
    assetParam?: string
    /** Registry symbol per vault assetId. */
    symbols: Record<string, string>
    /** Wallet transferable balance × spot price per vault assetId. */
    balancesUsd: Record<string, number>
  },
): PropellerVaultConfig | null => {
  const param = assetParam?.toLowerCase()
  const byParam =
    param && vaults.find((v) => symbols[v.assetId]?.toLowerCase() === param)
  if (byParam) return byParam

  const richest = vaults.reduce<PropellerVaultConfig | null>((best, v) => {
    const usd = balancesUsd[v.assetId] ?? 0
    const bestUsd = best ? (balancesUsd[best.assetId] ?? 0) : 0
    return usd > bestUsd ? v : best
  }, null)

  return richest ?? vaults[0] ?? null
}
