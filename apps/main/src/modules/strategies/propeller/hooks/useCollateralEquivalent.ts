import { useQueries } from "@tanstack/react-query"
import Big from "big.js"

import { spotPriceQuery } from "@/api/spotPrice"
import {
  PROPELLER_VAULTS,
  type PropellerVaultConfig,
} from "@/modules/strategies/propeller/config/vaults"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

/** Collateral amounts converted to the vault's base asset at spot price. */
export const useCollateralEquivalent = () => {
  const rpc = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const prices = useQueries({
    queries: PROPELLER_VAULTS.map((vault) =>
      spotPriceQuery(rpc, vault.assetId, vault.baseAssetId ?? ""),
    ),
  })

  return (vault: PropellerVaultConfig, amount: number | string) => {
    const index = PROPELLER_VAULTS.findIndex(
      (v) => v.vaultAddress === vault.vaultAddress,
    )
    const price = prices[index]?.data?.spotPrice
    if (!vault.baseAssetId || !price) return null
    return {
      value: Big(amount).times(price).toString(),
      symbol: getAssetWithFallback(vault.baseAssetId).symbol,
    }
  }
}
