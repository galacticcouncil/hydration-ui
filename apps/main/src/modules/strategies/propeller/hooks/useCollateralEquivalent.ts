import { useQueries } from "@tanstack/react-query"
import Big from "big.js"
import { create } from "zustand"

import { spotPriceQuery } from "@/api/spotPrice"
import {
  PROPELLER_VAULTS,
  type PropellerVaultConfig,
  vaultCollateralDisplayId,
  vaultDisplayAssetId,
} from "@/modules/strategies/propeller/config/vaults"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

/**
 * What unit the Juicer UI speaks: the vault's base asset (ETH for the GETH
 * vault) or the collateral under its product identity (GETH). Vaults without a base asset show
 * their collateral either way.
 */
export type PropellerDenomination = "base" | "collateral"

type DenominationStore = {
  denomination: PropellerDenomination
  setDenomination: (denomination: PropellerDenomination) => void
}

// The testing toggle is hidden; the mode is kept in memory only so a stale
// persisted value can never strand anyone in collateral denomination. Flip
// the default (or restore the page toggle) to bring GETH mode back.
export const usePropellerDenomination = create<DenominationStore>()((set) => ({
  denomination: "base",
  setDenomination: (denomination) => set({ denomination }),
}))

/**
 * Collateral -> display-asset spot rate per vault (GETH -> ETH in base
 * denomination, "1" in collateral denomination or when they coincide; null
 * while the rate is loading — callers must hold amounts back rather than show
 * them in the wrong unit).
 */
export const useBaseRates = () => {
  const rpc = useRpcProvider()
  const denomination = usePropellerDenomination((s) => s.denomination)
  const prices = useQueries({
    queries: PROPELLER_VAULTS.map((vault) =>
      spotPriceQuery(rpc, vault.assetId, vault.baseAssetId ?? ""),
    ),
  })
  const converting = denomination === "base"

  return {
    denomination,
    getRate: (vault: PropellerVaultConfig): string | null => {
      if (!converting || !vault.baseAssetId) return "1"
      const index = PROPELLER_VAULTS.findIndex(
        (v) => v.vaultAddress === vault.vaultAddress,
      )
      return prices[index]?.data?.spotPrice ?? null
    },
    isLoading:
      converting &&
      prices.some((q, i) => PROPELLER_VAULTS[i]?.baseAssetId && q.isLoading),
  }
}

/**
 * The asset every user-facing amount is denominated in under the current
 * denomination: the base asset (ETH), or the collateral under its product
 * identity (GETH) — the money market's reserve-display convention.
 */
export const useVaultDisplayAsset = () => {
  const { getAssetWithFallback } = useAssets()
  const denomination = usePropellerDenomination((s) => s.denomination)

  return (vault: PropellerVaultConfig) =>
    denomination === "base"
      ? getAssetWithFallback(vaultDisplayAssetId(vault))
      : getAssetWithFallback(vaultCollateralDisplayId(vault))
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
