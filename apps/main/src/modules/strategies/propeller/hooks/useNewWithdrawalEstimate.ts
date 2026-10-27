import { useQuery } from "@tanstack/react-query"
import { type Hex } from "viem"

import { useBlockTime } from "@/api/chain"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import { debtPerCollateral } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import { vaultQueueQuery } from "@/modules/strategies/propeller/hooks/useRedemptionQueue"
import { vaultSettleLogsQuery } from "@/modules/strategies/propeller/hooks/useSettlePace"
import {
  subLoopQuery,
  vaultStatsQuery,
} from "@/modules/strategies/propeller/hooks/useVaultReads"
import {
  claimableInSeconds,
  measureSettlePace,
  reserveCoversExit,
} from "@/modules/strategies/propeller/utils/withdrawalEta"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

/**
 * When a withdrawal requested now would be fully claimable: the cooldown, then
 * everything already queued, then this amount, at the keeper's measured pace.
 */
export const useNewWithdrawalEstimate = (
  vault: PropellerVaultConfig,
  evmAddress: Hex | undefined,
) => {
  const rpc = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const { decimals } = getAssetWithFallback(vault.assetId)
  const { data: blockTimeMs } = useBlockTime()
  const { data: stats } = useQuery(vaultStatsQuery(rpc, vault, decimals))
  const { data: subLoop } = useQuery(subLoopQuery(rpc))
  const { data: queue } = useQuery(
    vaultQueueQuery(rpc, vault, decimals, evmAddress),
  )
  const { data: settleLogs } = useQuery(
    vaultSettleLogsQuery(rpc, vault, decimals),
  )

  const pace =
    settleLogs && blockTimeMs
      ? measureSettlePace(settleLogs.logs, blockTimeMs / 1000)
      : null
  const ahead = (queue?.queued ?? []).reduce((sum, q) => sum + q.remaining, 0)

  /** `collateral` in collateral units (GETH, not ETH) */
  return (collateral: number) => {
    const reserveShort = !reserveCoversExit({
      carry: subLoop?.negativeCarry ?? null,
      reserveHollar: stats?.protocolReserveHollar ?? null,
      debtPerCollateral: debtPerCollateral(
        stats?.mainDebtUsd,
        stats?.totalAssets,
      ),
      collateral: ahead + collateral,
    })
    return {
      reserveShort,
      seconds:
        reserveShort || !stats || !queue
          ? null
          : claimableInSeconds({
              pace,
              remaining: collateral,
              ahead,
              cooldownLeftSeconds: stats.withdrawalDelay,
              started: false,
              sinceLastSettleSeconds: null,
            }),
    }
  }
}
