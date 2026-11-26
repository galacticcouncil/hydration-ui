import { type JuicerVaultConfig } from "@/modules/strategies/juicer/config/vaults"

export type JuicerDepositOption = {
  vault: JuicerVaultConfig
  /** asset the user pays with */
  assetId: string
}

/**
 * The base asset leads (the user thinks in ETH, not the pool-share
 * collateral), other pay assets follow, the raw collateral comes last.
 */
const payAssets = (vault: JuicerVaultConfig) => {
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
  vaults: ReadonlyArray<JuicerVaultConfig>,
): JuicerDepositOption[] =>
  vaults.flatMap((vault) =>
    payAssets(vault).map((assetId) => ({ vault, assetId })),
  )

export const isSwapDeposit = ({ vault, assetId }: JuicerDepositOption) =>
  assetId !== vault.assetId

/** the collateral's product token (GETH) converts 1:1: a deposit, not a swap */
export const isOneToOneDeposit = ({ vault, assetId }: JuicerDepositOption) =>
  assetId !== vault.assetId && assetId === vault.collateralDisplayId

/**
 * Drops the raw pool-share collateral (2-Pool-GETH) the wallet does not hold,
 * when the vault has other pay assets; every other asset shows even at zero.
 * `keep` stays listed regardless, so the picker never loses its selection.
 */
export const visibleDepositOptions = (
  options: ReadonlyArray<JuicerDepositOption>,
  getBalance: (assetId: string) => bigint,
  keep?: JuicerDepositOption,
): JuicerDepositOption[] =>
  options.filter(
    (o) =>
      o.assetId !== o.vault.assetId ||
      getBalance(o.assetId) > 0n ||
      (o.vault === keep?.vault && o.assetId === keep.assetId) ||
      !options.some((other) => other.vault === o.vault && other !== o),
  )
