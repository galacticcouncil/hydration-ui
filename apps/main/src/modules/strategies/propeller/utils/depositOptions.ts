import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"

export type PropellerDepositOption = {
  vault: PropellerVaultConfig
  /** asset the user pays with */
  assetId: string
}

/** collateral first, then the assets a swap converts into it */
const payAssets = (vault: PropellerVaultConfig) => [
  vault.assetId,
  ...(vault.payAssetIds ?? (vault.baseAssetId ? [vault.baseAssetId] : [])),
]

export const getDepositOptions = (
  vaults: ReadonlyArray<PropellerVaultConfig>,
): PropellerDepositOption[] =>
  vaults.flatMap((vault) =>
    payAssets(vault).map((assetId) => ({ vault, assetId })),
  )

export const isSwapDeposit = ({ vault, assetId }: PropellerDepositOption) =>
  assetId !== vault.assetId

/** the first asset the wallet holds, collateral first; the collateral if none */
export const getVaultDepositOption = (
  vault: PropellerVaultConfig,
  getBalance: (assetId: string) => bigint,
): PropellerDepositOption => ({
  vault,
  assetId:
    payAssets(vault).find((assetId) => getBalance(assetId) > 0n) ??
    vault.assetId,
})
