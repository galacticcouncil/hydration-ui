import { useQueries, useQuery } from "@tanstack/react-query"
import { type Hex } from "viem"

import { useBlockTime } from "@/api/chain"
import {
  PROPELLER_VAULTS,
  type PropellerVaultConfig,
} from "@/modules/strategies/propeller/config/vaults"
import { usePropellerVaults } from "@/modules/strategies/propeller/hooks/usePropellerVaults"
import {
  type QueueEntry,
  vaultQueueQuery,
} from "@/modules/strategies/propeller/hooks/useRedemptionQueue"
import { vaultSettleLogsQuery } from "@/modules/strategies/propeller/hooks/useSettlePace"
import {
  subLoopQuery,
  vaultBalancesQuery,
} from "@/modules/strategies/propeller/hooks/useVaultReads"
import {
  type WithdrawalState,
  withdrawalState,
} from "@/modules/strategies/propeller/utils/accounting"
import { type HarvestStatus } from "@/modules/strategies/propeller/utils/harvestStatus"
import {
  claimableInSeconds,
  measureSettlePace,
  reserveCoversExit,
  type SettlePace,
} from "@/modules/strategies/propeller/utils/withdrawalEta"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

export type PropellerPosition = {
  vault: PropellerVaultConfig
  /** includes funded earnings */
  shares: number
  sharesExact: string
  assetValue: number
  usdValue: number
  /** current accrual rate: strategy APY x deployed fraction, 0 while paused */
  apy: number | null
  /** the vault's deployed share, which every holder earns at */
  deployedFraction: number | null
  accrualPaused: boolean
  /** collateral earned but not harvested, outside the balance; null if unread */
  pendingYield: number | null
  /** the vault's collateral asset still sitting in the wallet */
  collateralBalance: number
  harvestStatus: HarvestStatus | null
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
  state: WithdrawalRowState
  collateralOwed?: number
  collateralSettled?: number
  settledSoFar?: number
  /**
   * until the whole withdrawal is claimable, at the keeper's measured pace
   * behind everything ahead in the queue; null while unknown, stalled or done
   */
  claimableInSeconds: number | null
  /** the reserve can't cover the strategy shortfall up to this exit */
  reserveShort: boolean
  eligibleAt: number
  mainDebt: Hex
  surplusHollar: number
  sourcePending: boolean
}

export const withdrawalRowId = (vaultAddress: string, requestId: number) =>
  `${vaultAddress}:${requestId}`

/**
 * One withdrawal row from a queue entry. Pays out the measured settlement when
 * there is one. Funding deficits delay payment without reducing the claim.
 */
export const buildWithdrawalRow = ({
  vault,
  entry,
  exchangeRate,
  price,
  baseRate = 1,
  pace = null,
  ahead = 0,
  sinceLastSettleSeconds = null,
  shortfall,
}: {
  vault: PropellerVaultConfig
  entry: QueueEntry
  exchangeRate: number
  price: number
  /** collateral -> display-asset spot (GETH -> ETH); 1 when they coincide */
  baseRate?: number
  pace?: SettlePace | null
  /** collateral still to settle for earlier requests */
  ahead?: number
  /** since this request's latest tranche; null before its first */
  sinceLastSettleSeconds?: number | null
  shortfall?: Omit<Parameters<typeof reserveCoversExit>[0], "collateral">
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
  // collateral entitlement, minus earlier partial claims while the request is
  // open; USD prices the collateral, display amounts are converted to the
  // vault's display asset below
  const estCollateral = entry.started
    ? entry.collateralOwed - (entry.active ? entry.claimedCollateral : 0)
    : entry.shares * exchangeRate

  // collateral units, like the pace: owed minus settled once started,
  // the shares' current value before
  const remainingCollateral = entry.started
    ? entry.collateralOwed - settledSoFar
    : entry.shares * exchangeRate
  const open = entry.active && remainingCollateral > 0
  const claimableIn = open
    ? claimableInSeconds({
        pace,
        remaining: remainingCollateral,
        ahead,
        cooldownLeftSeconds: (entry.eligibleAt - entry.observedAt) / 1000,
        started: entry.started,
        sinceLastSettleSeconds,
      })
    : null
  const reserveShort =
    open &&
    !!shortfall &&
    !reserveCoversExit({
      ...shortfall,
      collateral: ahead + remainingCollateral,
    })

  return {
    id: withdrawalRowId(vault.vaultAddress, entry.requestId),
    requestId: entry.requestId,
    vault,
    amountShares: entry.shares,
    estEth: estCollateral * baseRate,
    estUsd: estCollateral * price,
    isEstimate: !entry.started,
    state,
    collateralOwed: entry.collateralOwed * baseRate,
    collateralSettled: entry.collateralSettled * baseRate,
    settledSoFar: settledSoFar * baseRate,
    claimableInSeconds: reserveShort ? null : claimableIn,
    reserveShort,
    eligibleAt: entry.eligibleAt,
    mainDebt: entry.mainDebt,
    surplusHollar: entry.surplusHollar,
    sourcePending: entry.sourcePending,
  }
}

/** HOLLAR of Main debt per collateral unit; HOLLAR is priced at $1 */
export const debtPerCollateral = (
  mainDebtUsd: number | null | undefined,
  totalCollateral: number | undefined,
) =>
  typeof mainDebtUsd === "number" && totalCollateral
    ? mainDebtUsd / totalCollateral
    : null

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
  const { data: blockTimeMs } = useBlockTime()

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
  const settleLogQueries = useQueries({
    queries: PROPELLER_VAULTS.map((vault) =>
      vaultSettleLogsQuery(rpc, vault, decimalsOf(vault)),
    ),
  })
  const { data: subLoop } = useQuery(subLoopQuery(rpc))
  const blockTimeSeconds = blockTimeMs ? blockTimeMs / 1000 : null

  if (!evmAddress) {
    return { positions: [], withdrawals: [], isLoading: false, isError: false }
  }

  const positions = PROPELLER_VAULTS.flatMap<PropellerPosition>((vault, i) => {
    const shares = balanceQueries[i]?.data?.shares ?? 0
    const pendingYield = balanceQueries[i]?.data?.pendingYield ?? null
    if (shares <= 0 && !((pendingYield ?? 0) > 0)) return []
    const market = markets[i]
    const assetValue = balanceQueries[i]?.data?.assetValue ?? 0
    // user-facing amounts leave this hook in the vault's display asset
    // (GETH balances show as ETH); USD prices the raw collateral value
    const baseRate = market?.baseRate ? Number(market.baseRate) : 1
    return [
      {
        vault,
        shares,
        sharesExact: balanceQueries[i]?.data?.sharesExact ?? "0",
        pendingYield: pendingYield === null ? null : pendingYield * baseRate,
        collateralBalance: balanceQueries[i]?.data?.eth ?? 0,
        harvestStatus:
          rpc.isReady && !balanceQueries[i]?.isError
            ? (balanceQueries[i]?.data?.harvestStatus ?? null)
            : null,
        assetValue: assetValue * baseRate,
        usdValue: assetValue * (market?.price ?? 0),
        apy: market?.runRateApy ?? null,
        deployedFraction: market?.deployedFraction ?? null,
        accrualPaused: market?.accrualPaused ?? false,
      },
    ]
  }).sort((a, b) => b.usdValue - a.usdValue)

  const withdrawals = sortWithdrawalRows(
    PROPELLER_VAULTS.flatMap((vault, i) => {
      const market = markets[i]
      const settleLogs = settleLogQueries[i]?.data
      const pace =
        settleLogs && blockTimeSeconds
          ? measureSettlePace(settleLogs.logs, blockTimeSeconds)
          : null
      const queued = queueQueries[i]?.data?.queued ?? []
      const stats = market?.stats
      const shortfall = {
        carry: subLoop?.negativeCarry ?? null,
        reserveHollar: stats?.protocolReserveHollar ?? null,
        debtPerCollateral: debtPerCollateral(stats?.mainDebtUsd, stats?.tvl),
      }
      return (userQueues[i] ?? []).map((entry) => {
        const lastTranche = settleLogs?.logs
          .filter((l) => l.requestId === entry.requestId && l.collateral > 0)
          .reduce<
            bigint | null
          >((last, l) => (last === null || l.blockNumber > last ? l.blockNumber : last), null)
        return buildWithdrawalRow({
          vault,
          entry,
          exchangeRate: market?.stats?.exchangeRate ?? 1,
          price: market?.price ?? 0,
          baseRate: market?.baseRate ? Number(market.baseRate) : 1,
          pace,
          ahead: queued
            .filter((q) => q.requestId < entry.requestId)
            .reduce((sum, q) => sum + q.remaining, 0),
          sinceLastSettleSeconds:
            lastTranche !== null &&
            lastTranche !== undefined &&
            settleLogs &&
            blockTimeSeconds
              ? Number(settleLogs.head - lastTranche) * blockTimeSeconds
              : null,
          shortfall,
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
