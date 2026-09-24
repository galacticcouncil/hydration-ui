import { useQueries } from "@tanstack/react-query"
import { type Hex } from "viem"

import {
  PROPELLER_VAULTS,
  type PropellerVaultConfig,
} from "@/modules/strategies/propeller/config/vaults"
import { usePropellerVaults } from "@/modules/strategies/propeller/hooks/usePropellerVaults"
import {
  type RedemptionSettlement,
  vaultSettlementsQuery,
} from "@/modules/strategies/propeller/hooks/useRedemptionHistory"
import {
  type QueueEntry,
  vaultQueueQuery,
} from "@/modules/strategies/propeller/hooks/useRedemptionQueue"
import {
  vaultBalancesQuery,
  vaultLoopPositionQuery,
} from "@/modules/strategies/propeller/hooks/useVaultReads"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

export type PropellerPosition = {
  vault: PropellerVaultConfig
  shares: number
  assetValue: number
  usdValue: number
  apy: number | null
}

export type WithdrawalRowState = "pending" | "partial" | "settled" | "claimed"

export type PropellerWithdrawalRow = {
  /** `${vaultAddress}:${requestId}` — requestId is only unique per vault. */
  id: string
  requestId: number
  vault: PropellerVaultConfig
  amountShares: number
  /** Measured payout once settled; otherwise a carry-discounted estimate. */
  estEth: number
  estUsd: number
  isEstimate?: boolean
  /** Payout and date are still being read from settlement logs. */
  isSettlementLoading?: boolean
  state: WithdrawalRowState
  settledDate?: Date
  collateralOwed?: number
  collateralSettled?: number
  settledSoFar?: number
  /** Unwind stalled; remainder will be written off. */
  willSettleShort?: boolean
}

export const withdrawalRowId = (vaultAddress: string, requestId: number) =>
  `${vaultAddress}:${requestId}`

/** Rows whose payout / date only exist in settlement logs. */
const needsSettlement = (entry: QueueEntry) =>
  !entry.active || entry.collateralSettled > 0 || entry.settledProgress > 0

/**
 * One withdrawal row from a queue entry. Pays out the measured settlement when
 * there is one, otherwise owed (or shares × exchange rate) minus SubLoop carry.
 */
export const buildWithdrawalRow = ({
  vault,
  entry,
  settlement,
  isSettlementLoading,
  exchangeRate,
  carry,
  pendingUnwind,
  price,
}: {
  vault: PropellerVaultConfig
  entry: QueueEntry
  settlement: RedemptionSettlement | undefined
  isSettlementLoading: boolean
  exchangeRate: number
  carry: number
  pendingUnwind: bigint | null | undefined
  price: number
}): PropellerWithdrawalRow => {
  const state: WithdrawalRowState = !entry.active
    ? "claimed"
    : entry.settledProgress >= 1
      ? "settled"
      : entry.settledProgress > 0
        ? "partial"
        : "pending"

  const settledSoFar = settlement?.collateralSettled ?? 0
  const hasSettled = settledSoFar > 0
  const estEth = hasSettled
    ? settledSoFar
    : entry.collateralOwed > 0
      ? entry.collateralOwed * (1 - carry)
      : entry.shares * exchangeRate * (1 - carry)

  return {
    id: withdrawalRowId(vault.vaultAddress, entry.requestId),
    requestId: entry.requestId,
    vault,
    amountShares: entry.shares,
    estEth,
    estUsd: estEth * price,
    isEstimate: !hasSettled,
    isSettlementLoading,
    state,
    settledDate: settlement?.firstSettledAt,
    collateralOwed: entry.collateralOwed,
    collateralSettled: entry.collateralSettled,
    settledSoFar,
    willSettleShort:
      entry.active && entry.settledProgress < 1 && pendingUnwind === 0n,
  }
}

export const sortWithdrawalRows = <
  T extends Pick<PropellerWithdrawalRow, "requestId">,
>(
  rows: T[],
): T[] => [...rows].sort((a, b) => b.requestId - a.requestId)

/** The user's positions and withdrawal rows across every vault. */
export const usePropellerAccount = (evmAddress: Hex | undefined) => {
  const rpc = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const { vaults: markets, subLoop } = usePropellerVaults()

  const decimalsOf = (vault: PropellerVaultConfig) =>
    getAssetWithFallback(vault.assetId).decimals

  const balanceQueries = useQueries({
    queries: PROPELLER_VAULTS.map((vault) =>
      vaultBalancesQuery(rpc, vault, decimalsOf(vault), evmAddress),
    ),
  })
  const queueQueries = useQueries({
    queries: PROPELLER_VAULTS.map((vault) =>
      vaultQueueQuery(rpc, vault, decimalsOf(vault), evmAddress),
    ),
  })
  const userQueues = queueQueries.map((q) =>
    (q.data?.queue ?? []).filter((entry) => entry.isUser),
  )
  const settlementQueries = useQueries({
    queries: PROPELLER_VAULTS.map((vault, i) => {
      const ids = (userQueues[i] ?? [])
        .filter(needsSettlement)
        .map((entry) => entry.requestId)
      return vaultSettlementsQuery(
        rpc,
        vault,
        decimalsOf(vault),
        ids.length ? Math.min(...ids) : undefined,
      )
    }),
  })
  const loopPositionQueries = useQueries({
    queries: PROPELLER_VAULTS.map((vault) =>
      vaultLoopPositionQuery(rpc, vault),
    ),
  })

  if (!evmAddress) {
    return { positions: [], withdrawals: [], isLoading: false }
  }

  const carry = subLoop?.negativeCarry ?? 0

  const positions = PROPELLER_VAULTS.flatMap<PropellerPosition>((vault, i) => {
    const shares = balanceQueries[i]?.data?.shares ?? 0
    if (shares <= 0) return []
    const market = markets[i]
    const assetValue = shares * (market?.stats?.exchangeRate ?? 1)
    return [
      {
        vault,
        shares,
        assetValue,
        usdValue: assetValue * (market?.price ?? 0),
        apy: market?.apy ?? null,
      },
    ]
  }).sort((a, b) => b.usdValue - a.usdValue)

  const withdrawals = sortWithdrawalRows(
    PROPELLER_VAULTS.flatMap((vault, i) => {
      const market = markets[i]
      const settlementQuery = settlementQueries[i]
      const settlementByReqId = new Map(
        (settlementQuery?.data ?? []).map((s) => [s.requestId, s]),
      )
      const settlementFetching =
        !!settlementQuery?.isPending || !!settlementQuery?.isPlaceholderData
      return (userQueues[i] ?? []).map((entry) => {
        const settlement = settlementByReqId.get(entry.requestId)
        return buildWithdrawalRow({
          vault,
          entry,
          settlement,
          isSettlementLoading:
            !settlement && settlementFetching && needsSettlement(entry),
          exchangeRate: market?.stats?.exchangeRate ?? 1,
          carry,
          pendingUnwind: loopPositionQueries[i]?.data?.pendingUnwind,
          price: market?.price ?? 0,
        })
      })
    }),
  )

  return {
    positions,
    withdrawals,
    isLoading:
      balanceQueries.some((q) => q.isLoading) ||
      queueQueries.some((q) => q.isLoading),
  }
}
