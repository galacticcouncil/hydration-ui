import { getAddressFromAssetId } from "@galacticcouncil/utils"
import { queryOptions, useQueries } from "@tanstack/react-query"
import Big from "big.js"
import { type Hex } from "viem"

import { PRICE_ORACLE_ABI } from "@/modules/strategies/propeller/config/abi"
import {
  PROPELLER_VAULTS,
  type PropellerVaultConfig,
  vaultDisplayAssetId,
} from "@/modules/strategies/propeller/config/vaults"
import { POOL_ADDRESS } from "@/modules/strategies/propeller/constants"
import { propellerQueryKeys } from "@/modules/strategies/propeller/utils/queryKeys"
import { useAssets } from "@/providers/assetsProvider"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

/**
 * Collateral -> base-asset rate per vault (GETH -> ETH) from the money-market
 * oracle: the valuation the vault itself prices collateral with. The SDK spot
 * drifts over a long session (a live app read 1/0.984 while a fresh context
 * read 1.0173), so every ETH amount would be off by ~0.1%.
 */
const baseRateQuery = (
  { isReady, evm }: TProviderContext,
  vault: PropellerVaultConfig,
) =>
  queryOptions({
    queryKey: propellerQueryKeys.baseRate(vault.vaultAddress),
    enabled: isReady && !!vault.baseAssetId,
    queryFn: async () => {
      const read = <T>(
        address: Hex,
        functionName: "ADDRESSES_PROVIDER" | "getPriceOracle",
      ) =>
        evm.readContract({
          address,
          abi: PRICE_ORACLE_ABI,
          functionName,
        }) as Promise<T>
      const provider = await read<Hex>(POOL_ADDRESS, "ADDRESSES_PROVIDER")
      const oracle = await read<Hex>(provider, "getPriceOracle")
      const price = (assetId: string) =>
        evm.readContract({
          address: oracle,
          abi: PRICE_ORACLE_ABI,
          functionName: "getAssetPrice",
          args: [getAddressFromAssetId(assetId) as Hex],
        })
      const [collateral, base] = await Promise.all([
        price(vault.assetId),
        price(vault.baseAssetId ?? ""),
      ])
      if (base === 0n) throw new Error("No oracle price for the base asset")
      return Big(collateral.toString()).div(base.toString()).toString()
    },
    refetchInterval: 30_000,
  })

/**
 * Collateral -> base-asset rate per vault. "1" for vaults whose collateral is
 * the display asset, null while the rate is loading — callers must hold
 * amounts back rather than show them in the wrong unit.
 */
export const useBaseRates = () => {
  const rpc = useRpcProvider()
  const rates = useQueries({
    queries: PROPELLER_VAULTS.map((vault) => baseRateQuery(rpc, vault)),
  })

  return {
    getRate: (vault: PropellerVaultConfig): string | null => {
      if (!vault.baseAssetId) return "1"
      const index = PROPELLER_VAULTS.findIndex(
        (v) => v.vaultAddress === vault.vaultAddress,
      )
      return rates[index]?.data ?? null
    },
    isLoading: rates.some(
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
