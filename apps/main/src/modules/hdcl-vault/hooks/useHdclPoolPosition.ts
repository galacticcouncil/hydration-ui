import { useQuery } from "@tanstack/react-query"
import { formatUnits, getContract, type Hex } from "viem"

import {
  getVaultEvmClient,
  HDCL_POOL_ABI,
  HDCL_POOL_ADDRESS,
  HDCL_PRECOMPILE_ADDRESS,
} from "@/modules/hdcl-vault/constants"

export interface HdclPoolPosition {
  /** Sum of supplied collateral, in USD. */
  totalCollateralUsd: number
  /** Sum of outstanding debt, in USD. */
  totalDebtUsd: number
  /** USD value the user can still borrow given current collateral + LTV. */
  availableBorrowsUsd: number
  /**
   * User's current effective LTV (basis-points → percentage).
   * For the HDCL pool with a single collateral asset, this matches the
   * asset's reserve LTV.
   */
  ltvPct: number
  /** Liquidation threshold (basis-points → percentage). */
  liquidationThresholdPct: number
  /**
   * Aave health factor. >1 = safe, ≤1 = liquidatable. `Infinity` when the
   * user has zero debt (Aave returns max-uint256 in that case, which we
   * surface as Infinity for cleaner downstream consumers).
   */
  healthFactor: number
  /** Whether the user has any supplied collateral on this pool. */
  hasCollateral: boolean
}

/**
 * Reads the user's account state on the HDCL Aave pool.
 *
 * Drives `AvailableToBorrowCard` + the health-factor display in the Borrow
 * modal. Single contract round-trip via `pool.getUserAccountData` — Aave
 * does the per-reserve aggregation server-side so we don't have to.
 *
 * Note: this lives in its own hook rather than the existing `useVaultReads`
 * because the HDCL pool is a *separate* Aave instance from the main money
 * market — different addresses, different lifetime. The data isn't useful
 * outside the HDCL strategy page.
 */
export function useHdclPoolPosition(evmAddress: Hex | undefined) {
  return useQuery({
    queryKey: ["hdcl-pool-position", evmAddress],
    enabled: !!evmAddress,
    queryFn: async (): Promise<HdclPoolPosition> => {
      if (!evmAddress) {
        return {
          totalCollateralUsd: 0,
          totalDebtUsd: 0,
          availableBorrowsUsd: 0,
          ltvPct: 0,
          liquidationThresholdPct: 0,
          healthFactor: Infinity,
          hasCollateral: false,
        }
      }

      const pool = getContract({
        address: HDCL_POOL_ADDRESS,
        abi: HDCL_POOL_ABI,
        client: getVaultEvmClient(),
      })

      const [
        totalCollateralBase,
        totalDebtBase,
        availableBorrowsBase,
        currentLiquidationThreshold,
        ltv,
        healthFactor,
      ] = await pool.read.getUserAccountData([evmAddress])

      // Aave returns max-uint256 for healthFactor when the user has no debt.
      // Surface as Infinity for cleaner UI checks (`>= 1.0`, etc.).
      const hfNum =
        healthFactor === BigInt(2) ** BigInt(256) - BigInt(1)
          ? Infinity
          : Number(formatUnits(healthFactor, 18))

      return {
        totalCollateralUsd: Number(formatUnits(totalCollateralBase, 8)),
        totalDebtUsd: Number(formatUnits(totalDebtBase, 8)),
        availableBorrowsUsd: Number(formatUnits(availableBorrowsBase, 8)),
        // Aave returns LTV / liqThreshold as basis-points (e.g. 8000 = 80%).
        ltvPct: Number(ltv) / 100,
        liquidationThresholdPct: Number(currentLiquidationThreshold) / 100,
        healthFactor: hfNum,
        hasCollateral: totalCollateralBase > 0n,
      }
    },
    refetchInterval: 30_000,
  })
}

export interface HdclReserveConfig {
  /** Max LTV (percentage) applied to a fresh HDCL supply. */
  maxLtvPct: number
  /** Liquidation threshold (percentage). Below this and the position is liquidatable. */
  liquidationThresholdPct: number
}

/**
 * Static reserve configuration for HDCL on the HDCL Aave pool. Drives the
 * Strategy overview's Max LTV / Liquidation LTV display, replacing the
 * static placeholders in `STRATEGY` (which can drift if governance changes
 * the on-chain values).
 *
 * Aave V3 packs the configuration into a single uint256 — bits 0-15 hold
 * the LTV in basis points and bits 16-31 hold the liquidation threshold,
 * also in basis points. We mask + shift to extract, then divide by 100 to
 * convert bps → percentage.
 */
export function useHdclReserveConfig() {
  return useQuery({
    queryKey: ["hdcl-reserve-config"],
    queryFn: async (): Promise<HdclReserveConfig> => {
      const pool = getContract({
        address: HDCL_POOL_ADDRESS,
        abi: HDCL_POOL_ABI,
        client: getVaultEvmClient(),
      })
      const config = await pool.read.getConfiguration([HDCL_PRECOMPILE_ADDRESS])
      const data = config.data
      const ltvBps = Number(data & 0xffffn)
      const liqThresholdBps = Number((data >> 16n) & 0xffffn)
      return {
        maxLtvPct: ltvBps / 100,
        liquidationThresholdPct: liqThresholdBps / 100,
      }
    },
    refetchInterval: 60_000,
  })
}
