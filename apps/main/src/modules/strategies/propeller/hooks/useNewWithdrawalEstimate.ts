import { useQueries, useQuery } from "@tanstack/react-query"
import { type Hex, parseUnits } from "viem"

import {
  PROPELLER_VAULTS,
  type PropellerVaultConfig,
} from "@/modules/strategies/propeller/config/vaults"
import { exitBacklogQuery } from "@/modules/strategies/propeller/hooks/useExitBacklog"
import { exitHeadroomQuery } from "@/modules/strategies/propeller/hooks/useExitHeadroom"
import { debtPerCollateral } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import { vaultQueueQuery } from "@/modules/strategies/propeller/hooks/useRedemptionQueue"
import {
  subLoopQuery,
  vaultStatsQuery,
} from "@/modules/strategies/propeller/hooks/useVaultReads"
import { headroomExitFits } from "@/modules/strategies/propeller/utils/headroomExit"
import {
  claimableInSeconds,
  notStartedEquity,
  reserveCoversExit,
} from "@/modules/strategies/propeller/utils/withdrawalEta"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

/**
 * When a withdrawal requested now would be fully claimable: the cooldown, then
 * the keeper's exit backlog, which every started withdrawal in every vault
 * shares, with this one and the requests not started yet added to it. An exit
 * the vault's headroom would absorb skips the backlog.
 */
export const useNewWithdrawalEstimate = (
  vault: PropellerVaultConfig,
  evmAddress: Hex | undefined,
) => {
  const rpc = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const decimalsOf = (v: PropellerVaultConfig) =>
    getAssetWithFallback(v.assetId).decimals
  const index = PROPELLER_VAULTS.findIndex(
    (v) => v.vaultAddress === vault.vaultAddress,
  )
  const statsQueries = useQueries({
    queries: PROPELLER_VAULTS.map((v) =>
      vaultStatsQuery(rpc, v, decimalsOf(v)),
    ),
  })
  const queueQueries = useQueries({
    queries: PROPELLER_VAULTS.map((v) =>
      vaultQueueQuery(rpc, v, decimalsOf(v), evmAddress),
    ),
  })
  const { data: subLoop } = useQuery(subLoopQuery(rpc))
  const { data: backlog } = useQuery(exitBacklogQuery(rpc))
  const { data: headroom } = useQuery(exitHeadroomQuery(rpc, vault))

  const debtPerCollateralOf = (i: number) =>
    debtPerCollateral(
      statsQueries[i]?.data?.mainDebtUsd,
      statsQueries[i]?.data?.totalAssets,
    )
  const stats = statsQueries[index]?.data
  const queue = queueQueries[index]?.data
  const ahead = (queue?.queued ?? []).reduce((sum, q) => sum + q.remaining, 0)
  const notStartedHollar = notStartedEquity(
    PROPELLER_VAULTS.map((_, i) => ({
      queued: queueQueries[i]?.data?.queued ?? [],
      debtPerCollateral: debtPerCollateralOf(i),
    })),
  )

  /** `collateral` in collateral units (GETH, not ETH) */
  return (collateral: number) => {
    const perCollateral = debtPerCollateralOf(index)
    const reserveShort = !reserveCoversExit({
      carry: subLoop?.negativeCarry ?? null,
      reserveHollar: stats?.protocolReserveHollar ?? null,
      debtPerCollateral: perCollateral,
      collateral: ahead + collateral,
    })
    // the vault settles FIFO, so an unwinding exit ahead holds this one too
    const viaHeadroom =
      !!headroom &&
      !!queue &&
      !queue.queued.some((q) => q.unwinding) &&
      // toFixed turns exponential from 1e21 on, which parseUnits rejects
      collateral > 0 &&
      collateral < 1e21 &&
      headroomExitFits(
        headroom,
        parseUnits(collateral.toFixed(decimalsOf(vault)), decimalsOf(vault)),
      )
    return {
      reserveShort,
      seconds:
        reserveShort ||
        !stats ||
        !queue ||
        (perCollateral === null && !viaHeadroom)
          ? null
          : claimableInSeconds({
              backlog: backlog ?? null,
              notStartedHollar:
                notStartedHollar + collateral * (perCollateral ?? 0),
              cooldownLeftSeconds: stats.withdrawalDelay,
              started: false,
              waitsOnUnwind: !viaHeadroom,
            }),
    }
  }
}
