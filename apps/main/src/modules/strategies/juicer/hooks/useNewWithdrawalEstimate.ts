import { useQueries, useQuery } from "@tanstack/react-query"
import { type Hex } from "viem"

import {
  JUICER_VAULTS,
  type JuicerVaultConfig,
} from "@/modules/strategies/juicer/config/vaults"
import { exitBacklogQuery } from "@/modules/strategies/juicer/hooks/useExitBacklog"
import { exitHeadroomQuery } from "@/modules/strategies/juicer/hooks/useExitHeadroom"
import { debtPerCollateral } from "@/modules/strategies/juicer/hooks/useJuicerAccount"
import {
  projectQueue,
  vaultQueueQuery,
} from "@/modules/strategies/juicer/hooks/useRedemptionQueue"
import {
  subLoopQuery,
  vaultStatsQuery,
} from "@/modules/strategies/juicer/hooks/useVaultReads"
import {
  claimableInSeconds,
  notStartedUnwind,
  reserveCoversExit,
  START_SECONDS,
} from "@/modules/strategies/juicer/utils/withdrawalEta"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

/**
 * When a withdrawal requested now would be fully claimable: the cooldown, then
 * the keeper's exit backlog, which every started withdrawal in every vault
 * shares, with this one and the requests not started yet added to it. Every
 * waiting exit, this one last, is judged as the keeper will start it: one the
 * vault's headroom absorbs skips the backlog, unless an unwinding one is ahead.
 */
export const useNewWithdrawalEstimate = (
  vault: JuicerVaultConfig,
  evmAddress: Hex | undefined,
) => {
  const rpc = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const decimalsOf = (v: JuicerVaultConfig) =>
    getAssetWithFallback(v.assetId).decimals
  const index = JUICER_VAULTS.findIndex(
    (v) => v.vaultAddress === vault.vaultAddress,
  )
  const statsQueries = useQueries({
    queries: JUICER_VAULTS.map((v) => vaultStatsQuery(rpc, v, decimalsOf(v))),
  })
  const queueQueries = useQueries({
    queries: JUICER_VAULTS.map((v) =>
      vaultQueueQuery(rpc, v, decimalsOf(v), evmAddress),
    ),
  })
  const { data: subLoop } = useQuery(subLoopQuery(rpc))
  const { data: backlog } = useQuery(exitBacklogQuery(rpc))
  const headroomQueries = useQueries({
    queries: JUICER_VAULTS.map((v) => exitHeadroomQuery(rpc, v)),
  })

  const debtPerCollateralOf = (i: number) =>
    debtPerCollateral(
      statsQueries[i]?.data?.mainDebtUsd,
      statsQueries[i]?.data?.totalAssets,
    )
  const projectedOf = (
    i: number,
    extra?: Parameters<typeof projectQueue>[3],
  ) => {
    const data = queueQueries[i]?.data
    const v = JUICER_VAULTS[i]!
    return data
      ? projectQueue(data, headroomQueries[i]?.data, decimalsOf(v), extra)
      : undefined
  }
  const stats = statsQueries[index]?.data
  const queue = queueQueries[index]?.data
  const ahead = (queue?.queued ?? []).reduce((sum, q) => sum + q.remaining, 0)
  const notStartedHollar = notStartedUnwind(
    JUICER_VAULTS.map((_, i) => ({
      queued: projectedOf(i)?.queued ?? [],
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
    // started behind the requests ahead, after the cooldown and a keeper turn
    const projected = stats
      ? projectedOf(index, {
          collateral,
          startsIn: stats.withdrawalDelay + START_SECONDS,
        })
      : undefined
    const own = projected?.extra ?? null
    const viaHeadroom = own?.viaHeadroom ?? false
    // the vault settles FIFO, so an unwinding exit ahead holds this one too
    const waitsOnUnwind =
      !viaHeadroom || !!projected?.queued.some((q) => q.unwinding)
    return {
      reserveShort,
      seconds:
        reserveShort || !stats || !queue || (perCollateral === null && !own)
          ? null
          : claimableInSeconds({
              backlog: backlog ?? null,
              // what the unwind must free for it from its start; a headroom
              // exit needs none from the unwind it may wait behind
              notStartedHollar:
                notStartedHollar +
                (own ? own.unwind : collateral * (perCollateral ?? 0)),
              cooldownLeftSeconds: stats.withdrawalDelay,
              started: false,
              deployment: own?.deployment,
              waitsOnUnwind,
            }),
    }
  }
}
