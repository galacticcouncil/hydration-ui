import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"

export type PropellerDepositOption = {
  vault: PropellerVaultConfig
  /** asset the user pays with */
  assetId: string
}

/**
 * The base asset leads (the user thinks in ETH, not the pool-share
 * collateral), other pay assets follow, the raw collateral comes last.
 */
const payAssets = (vault: PropellerVaultConfig) => {
  const swapAssets =
    vault.payAssetIds ?? (vault.baseAssetId ? [vault.baseAssetId] : [])
  return [
    ...new Set([
      ...(vault.baseAssetId ? [vault.baseAssetId] : []),
      ...swapAssets,
      vault.assetId,
    ]),
  ]
}

export const getDepositOptions = (
  vaults: ReadonlyArray<PropellerVaultConfig>,
): PropellerDepositOption[] =>
  vaults.flatMap((vault) =>
    payAssets(vault).map((assetId) => ({ vault, assetId })),
  )

export const isSwapDeposit = ({ vault, assetId }: PropellerDepositOption) =>
  assetId !== vault.assetId

/** the first asset the wallet holds, base asset first; the base asset if none */
export const getVaultDepositOption = (
  vault: PropellerVaultConfig,
  getBalance: (assetId: string) => bigint,
): PropellerDepositOption => ({
  vault,
  assetId:
    payAssets(vault).find((assetId) => getBalance(assetId) > 0n) ??
    payAssets(vault)[0] ??
    vault.assetId,
})
