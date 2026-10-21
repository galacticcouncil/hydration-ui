import { useQueries } from "@tanstack/react-query"
import Big from "big.js"

import { spotPriceQuery } from "@/api/spotPrice"
import {
  PROPELLER_VAULTS,
  type PropellerVaultConfig,
  vaultDisplayAssetId,
} from "@/modules/strategies/propeller/config/vaults"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

/**
 * Collateral -> base-asset spot rate per vault (GETH -> ETH). "1" for vaults
 * whose collateral is the display asset, null while the rate is loading —
 * callers must hold amounts back rather than show them in the wrong unit.
 */
export const useBaseRates = () => {
  const rpc = useRpcProvider()
  const prices = useQueries({
    queries: PROPELLER_VAULTS.map((vault) =>
      spotPriceQuery(rpc, vault.assetId, vault.baseAssetId ?? ""),
    ),
  })

  return {
    getRate: (vault: PropellerVaultConfig): string | null => {
      if (!vault.baseAssetId) return "1"
      const index = PROPELLER_VAULTS.findIndex(
        (v) => v.vaultAddress === vault.vaultAddress,
      )
      return prices[index]?.data?.spotPrice ?? null
    },
    isLoading: prices.some(
      (q, i) => PROPELLER_VAULTS[i]?.baseAssetId && q.isLoading,
    ),
  }
}

/**
 * The asset every user-facing amount is denominated in: the base asset (ETH
 * for the GETH vault), the collateral itself otherwise. Share and collateral
 * units never reach the user.
 */
export const useVaultDisplayAsset = () => {
  const { getAssetWithFallback } = useAssets()

  return (vault: PropellerVaultConfig) =>
    getAssetWithFallback(vaultDisplayAssetId(vault))
}

/** Collateral amounts converted to the vault's base asset at spot price. */
export const useCollateralEquivalent = () => {
  const { getAssetWithFallback } = useAssets()
  const { getRate } = useBaseRates()

  return (vault: PropellerVaultConfig, amount: number | string) => {
    const rate = getRate(vault)
    if (!vault.baseAssetId || rate === null) return null
    return {
      value: Big(amount).times(rate).toString(),
      symbol: getAssetWithFallback(vault.baseAssetId).symbol,
    }
  }
}
