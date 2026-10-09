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
import { vaultBalancesQuery } from "@/modules/strategies/propeller/hooks/useVaultReads"
import {
  type WithdrawalState,
  withdrawalState,
} from "@/modules/strategies/propeller/utils/accounting"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

export type PropellerPosition = {
  vault: PropellerVaultConfig
  /** includes funded earnings */
  shares: number
  sharesExact: string
  assetValue: number
  usdValue: number
  apy: number | null
  /** collateral earned but not harvested, outside the balance; null if unread */
  pendingYield: number | null
}

export type WithdrawalRowState = WithdrawalState

export type PropellerWithdrawalRow = {
  /** `${vaultAddress}:${requestId}` — requestId is only unique per vault. */
  id: string
  requestId: number
  vault: PropellerVaultConfig
  amountShares: number
  /** Full collateral entitlement, estimated until the unwind starts. */
  estEth: number
  estUsd: number
  isEstimate?: boolean
  /** Payout and date are still being read from settlement logs. */
  isSettlementLoading?: boolean
  state: WithdrawalRowState
  settledBlock?: bigint
  collateralOwed?: number
  collateralSettled?: number
  settledSoFar?: number
  eligibleAt: number
  mainDebt: Hex
  surplusHollar: number
  sourcePending: boolean
}

export const withdrawalRowId = (vaultAddress: string, requestId: number) =>
  `${vaultAddress}:${requestId}`

/** Rows whose payout / date only exist in settlement logs. */
const needsSettlement = (entry: QueueEntry) =>
  !entry.active || entry.collateralSettled > 0 || entry.settledProgress > 0

/**
 * One withdrawal row from a queue entry. Pays out the measured settlement when
 * there is one. Funding deficits delay payment without reducing the claim.
 */
export const buildWithdrawalRow = ({
  vault,
  entry,
  settlement,
  isSettlementLoading,
  exchangeRate,
  price,
}: {
  vault: PropellerVaultConfig
  entry: QueueEntry
  settlement: RedemptionSettlement | undefined
  isSettlementLoading: boolean
  exchangeRate: number
  price: number
}): PropellerWithdrawalRow => {
  const settledSoFar = entry.claimedCollateral + entry.collateralSettled
  const state = withdrawalState({
    active: entry.active,
    started: entry.started,
    eligibleAt: entry.eligibleAt,
    now: entry.observedAt,
    complete: entry.complete,
    settledAmount: settledSoFar,
  })
  const estEth = entry.started
    ? entry.collateralOwed
    : entry.shares * exchangeRate

  return {
    id: withdrawalRowId(vault.vaultAddress, entry.requestId),
    requestId: entry.requestId,
    vault,
    amountShares: entry.shares,
    estEth,
    estUsd: estEth * price,
    isEstimate: !entry.started,
    isSettlementLoading,
    state,
    settledBlock: settlement?.firstSettledBlock,
    collateralOwed: entry.collateralOwed,
    collateralSettled: entry.collateralSettled,
    settledSoFar,
    eligibleAt: entry.eligibleAt,
    mainDebt: entry.mainDebt,
    surplusHollar: entry.surplusHollar,
    sourcePending: entry.sourcePending,
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
  const { vaults: markets } = usePropellerVaults()

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
  const minSettlementId = (entries: QueueEntry[] | undefined) => {
    const ids = (entries ?? [])
      .filter(needsSettlement)
      .map((entry) => entry.requestId)
    return ids.length ? Math.min(...ids) : undefined
  }
  const activeSettlementQueries = useQueries({
    queries: PROPELLER_VAULTS.map((vault, i) =>
      vaultSettlementsQuery(
        rpc,
        vault,
        decimalsOf(vault),
        minSettlementId(userQueues[i]?.filter((entry) => entry.active)),
      ),
    ),
  })
  const historySettlementQueries = useQueries({
    queries: PROPELLER_VAULTS.map((vault, i) => {
      const active = activeSettlementQueries[i]
      const activeDone =
        !active?.isFetching || (!!active.data && !active.isPlaceholderData)
      return vaultSettlementsQuery(
        rpc,
        vault,
        decimalsOf(vault),
        activeDone ? minSettlementId(userQueues[i]) : undefined,
      )
    }),
  })

  if (!evmAddress) {
    return { positions: [], withdrawals: [], isLoading: false, isError: false }
  }

  const positions = PROPELLER_VAULTS.flatMap<PropellerPosition>((vault, i) => {
    const shares = balanceQueries[i]?.data?.shares ?? 0
    const pendingYield = balanceQueries[i]?.data?.pendingYield ?? null
    if (shares <= 0 && !((pendingYield ?? 0) > 0)) return []
    const market = markets[i]
    const assetValue = balanceQueries[i]?.data?.assetValue ?? 0
    return [
      {
        vault,
        shares,
        sharesExact: balanceQueries[i]?.data?.sharesExact ?? "0",
        pendingYield,
        assetValue,
        usdValue: assetValue * (market?.price ?? 0),
        apy: market?.apy ?? null,
      },
    ]
  }).sort((a, b) => b.usdValue - a.usdValue)

  const withdrawals = sortWithdrawalRows(
    PROPELLER_VAULTS.flatMap((vault, i) => {
      const market = markets[i]
      const activeQuery = activeSettlementQueries[i]
      const historyQuery = historySettlementQueries[i]
      // Either scan returns every log seen so far; the active one refreshes
      // unclaimed rows, so it wins on overlap.
      const settlementByReqId = new Map(
        [...(historyQuery?.data ?? []), ...(activeQuery?.data ?? [])].map(
          (s) => [s.requestId, s],
        ),
      )
      return (userQueues[i] ?? []).map((entry) => {
        const settlement = settlementByReqId.get(entry.requestId)
        const query = entry.active ? activeQuery : historyQuery
        const settlementFetching =
          !!query?.isPending || !!query?.isPlaceholderData
        return buildWithdrawalRow({
          vault,
          entry,
          settlement,
          isSettlementLoading:
            !settlement && settlementFetching && needsSettlement(entry),
          exchangeRate: market?.stats?.exchangeRate ?? 1,
          price: market?.price ?? 0,
        })
      })
    }),
  )

  return {
    positions,
    withdrawals,
    isError:
      balanceQueries.some((q) => q.isError) ||
      queueQueries.some((q) => q.isError),
    isLoading:
      balanceQueries.some((q) => q.isLoading) ||
      queueQueries.some((q) => q.isLoading),
  }
}
