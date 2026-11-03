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

/** the collateral's product token (GETH) converts 1:1: a deposit, not a swap */
export const isOneToOneDeposit = ({ vault, assetId }: PropellerDepositOption) =>
  assetId !== vault.assetId && assetId === vault.collateralDisplayId

/**
 * Drops the raw pool-share collateral (2-Pool-GETH) the wallet does not hold,
 * when the vault has other pay assets; every other asset shows even at zero.
 * `keep` stays listed regardless, so the picker never loses its selection.
 */
export const visibleDepositOptions = (
  options: ReadonlyArray<PropellerDepositOption>,
  getBalance: (assetId: string) => bigint,
  keep?: PropellerDepositOption,
): PropellerDepositOption[] =>
  options.filter(
    (o) =>
      o.assetId !== o.vault.assetId ||
      getBalance(o.assetId) > 0n ||
      (o.vault === keep?.vault && o.assetId === keep.assetId) ||
      !options.some((other) => other.vault === o.vault && other !== o),
  )
