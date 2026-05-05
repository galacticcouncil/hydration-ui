import { Flex, Grid } from "@galacticcouncil/ui/components"
import { safeConvertSS58toH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useState } from "react"
import { type Hex } from "viem"

import { AboutCard } from "./components/AboutCard"
import { AvailableToBorrowCard } from "./components/AvailableToBorrowCard"
import { BorrowHollarModal } from "./components/BorrowHollarModal"
import { DepositPanel } from "./components/DepositPanel"
import {
  MyWithdrawals,
  type WithdrawalRow,
  type WithdrawalRowState,
} from "./components/MyWithdrawals"
import { MyPositionsTable } from "./components/MyPositionsTable"
import { StrategyHeader } from "./components/StrategyHeader"
import { StrategyOverview } from "./components/StrategyOverview"
import { WithdrawModal } from "./components/WithdrawModal"
import { useHdclPoolPosition } from "./hooks/useHdclPoolPosition"
import { useBorrowHollar } from "./hooks/useHdclPoolWrites"
import { useInstantRedeem } from "./hooks/useStableswap"
import { useUserBalances, useVaultStats } from "./hooks/useVaultReads"
import {
  useCancelRedeem,
  useDeposit,
  useRequestRedeem,
  useRequestRedeemRaw,
  useSupplyRawHdcl,
} from "./hooks/useVaultWrites"
import { useRedemptionHistory } from "./hooks/useRedemptionHistory"
import { useRedemptionQueue } from "./hooks/useRedemptionQueue"

export const HdclVaultPage = () => {
  const { account } = useAccount()
  // Local UI toggles
  const [showRedeemed, setShowRedeemed] = useState(false)
  const [collapsedPositions, setCollapsedPositions] = useState(false)
  const [collapsedWithdrawals, setCollapsedWithdrawals] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [showBorrow, setShowBorrow] = useState(false)
  // Which HDCL form the open Withdraw modal is operating on. Selected by
  // which row's Withdraw button got clicked (aHDCL = canonical, raw = legacy).
  const [withdrawSource, setWithdrawSource] = useState<"supplied" | "raw">("supplied")

  // Derive EVM address from Substrate account
  const address = account?.address ?? ""
  const evmAddress = address ? (safeConvertSS58toH160(address) as Hex) : undefined

  // Contract reads
  const { data: vaultStats } = useVaultStats()
  const { data: balances } = useUserBalances(evmAddress)
  const { data: queueData } = useRedemptionQueue(evmAddress)
  const { data: historyData } = useRedemptionHistory(evmAddress)
  const { data: poolPosition } = useHdclPoolPosition(evmAddress)

  // Contract writes — `useDeposit` is now a batched approve+deposit+approve+supply,
  // so the page doesn't track HOLLAR allowance separately anymore.
  const depositMutation = useDeposit()
  const redeemMutation = useRequestRedeem()         // batched: pool.withdraw + vault.requestRedeem
  const redeemRawMutation = useRequestRedeemRaw()   // single-call vault.requestRedeem (legacy raw)
  const supplyRawMutation = useSupplyRawHdcl()      // recovery: approve + pool.supply for raw HDCL
  const cancelMutation = useCancelRedeem()
  const borrowMutation = useBorrowHollar()
  // Instant-redeem flow — swaps the user's LIQUID aHDCL balance via the
  // stableswap pool. Used by the WithdrawModal "Instant" path (user types
  // an amount). There's no per-row instant-redeem from the queue itself:
  // the SDK router can't trade raw HDCL (asset 55) because the HDCL Aave
  // pool is a separate Aave instance the SDK doesn't know about. Users
  // wanting an instant exit on a queued request must Cancel first (which
  // also re-supplies as aHDCL) and then use the WithdrawModal's instant
  // path.
  const instantRedeemMutation = useInstantRedeem()

  const isPending =
    depositMutation.isPending ||
    redeemMutation.isPending ||
    redeemRawMutation.isPending ||
    supplyRawMutation.isPending ||
    borrowMutation.isPending ||
    instantRedeemMutation.isPending

  // Defaults — vault stats might not be loaded on first paint
  const stats = vaultStats ?? {
    totalAssets: 0,
    totalSupply: 0,
    exchangeRate: 1,
    worstCaseWaitDays: 0,
    nextMaturityDays: 0,
    maxLockupDays: 62, // typical contract default (60d invest + 48h delay)
    tvlCap: 0,
    paused: false,
    depositsPaused: false,
    minDeposit: 10,
    minRedeem: 1,
    apr: 18,
  }

  const userBalances = balances ?? { hollar: 0, hdcl: 0, hdclRaw: 0, hdclSupplied: 0 }
  const queue = queueData?.queue ?? []

  // Build the unified withdrawal-rows model for MyWithdrawals.
  //
  // We need rows for both still-active requests (queued, awaiting maturity)
  // and completed ones (fulfilled or cancelled). The two data sources:
  //
  //   - useRedemptionQueue:   on-chain queue read via getRedemptionRequest.
  //                           Authoritative for *currently active* requests
  //                           (active === true). Doesn't know about completed
  //                           ones (they're removed from the queue).
  //   - useRedemptionHistory: event-log scan of RedemptionRequested /
  //                           Fulfilled / Cancelled. In principle covers
  //                           every state, but on lark we've seen getLogs
  //                           silently return [] even when the queue clearly
  //                           has matching entries — so we can't rely on it
  //                           as the sole source.
  //
  // Strategy: queue is the primary source for *active* rows, history is
  // merged in for timestamps + as the *only* source for completed rows.
  // If history is empty (broken RPC, fresh fork, etc.) active rows still
  // render using just queue data, with a sentinel requestedDate=epoch.

  const historyByReqId = new Map(
    (historyData ?? []).map((h) => [h.requestId, h]),
  )

  const activeRows: WithdrawalRow[] = queue
    .filter((e) => e.isUser)
    .map((e) => {
      const h = historyByReqId.get(e.requestId)
      const isStillActive =
        h?.state === "partial" || h?.state === "pending" || !h
      // Prefer history.state when present; fall back to "pending" (queue
      // entries with active === true are pending unless events say otherwise).
      const state: WithdrawalRowState = isStillActive
        ? (h?.state ?? "pending")
        : "pending"
      return {
        id: e.requestId,
        amountHdcl: e.hdclRemaining,
        // HOLLAR is $-pegged; queue exposes only HDCL units, so multiply by rate.
        estHollar: e.hdclRemaining * stats.exchangeRate,
        requestedDate: h?.requestedAt ?? new Date(0),
        state,
        timeRemainingDays: e.estTimeRemainingDays,
        fulfilledDate: h?.fulfilledAt ?? undefined,
      }
    })

  // Completed rows come exclusively from history (not in the active queue).
  const activeIds = new Set(activeRows.map((r) => r.id))
  const completedRows: WithdrawalRow[] = (historyData ?? [])
    .filter(
      (h) =>
        !activeIds.has(h.requestId) &&
        (h.state === "fulfilled" || h.state === "cancelled"),
    )
    .map((h) => ({
      id: h.requestId,
      amountHdcl:
        h.state === "fulfilled" ? h.hdclFulfilled : h.hdclRequested,
      estHollar:
        h.state === "fulfilled"
          ? h.hollarReceived
          : h.hdclRequested * stats.exchangeRate,
      requestedDate: h.requestedAt,
      state: h.state,
      fulfilledDate: h.fulfilledAt ?? undefined,
    }))

  const withdrawalRows: WithdrawalRow[] = [...activeRows, ...completedRows]

  return (
    <Flex direction="column" gap={20}>
      <StrategyHeader />

      <Grid
        columnTemplate={[
          null,
          null,
          "minmax(24rem, 1fr) minmax(0, 25rem)",
          "minmax(30rem, 1fr) minmax(0, 27rem)",
        ]}
        gap="xl"
        align="start"
      >
        {/* Left column — strategy + user position views */}
        <Flex direction="column" gap={20}>
          <MyPositionsTable
            hdclSupplied={userBalances.hdclSupplied ?? 0}
            hdclRaw={userBalances.hdclRaw ?? 0}
            exchangeRate={stats.exchangeRate}
            apyPercent={stats.apr}
            minDisplayBalance={stats.minRedeem}
            onWithdrawSupplied={() => {
              setWithdrawSource("supplied")
              setShowWithdraw(true)
            }}
            onWithdrawRaw={() => {
              setWithdrawSource("raw")
              setShowWithdraw(true)
            }}
            onDepositRaw={() =>
              supplyRawMutation.mutate(userBalances.hdclRaw ?? 0)
            }
            isDepositingRaw={supplyRawMutation.isPending}
            collapsed={collapsedPositions}
            onToggleCollapse={() => setCollapsedPositions((v) => !v)}
          />

          <MyWithdrawals
            rows={withdrawalRows}
            showRedeemed={showRedeemed}
            onShowRedeemedChange={setShowRedeemed}
            onCancelRedeem={(id) => cancelMutation.mutate(id)}
            isCancelling={cancelMutation.isPending}
            collapsed={collapsedWithdrawals}
            onToggleCollapse={() => setCollapsedWithdrawals((v) => !v)}
          />

          <StrategyOverview vaultStats={stats} />

          <AboutCard />
        </Flex>

        {/* Right column — Figma 6402:24464. Withdraw flow now lives in
            WithdrawModal (opened from MyPositionsTable Withdraw button). */}
        <Flex direction="column" gap={20}>
          <DepositPanel
            vaultStats={stats}
            balances={userBalances}
            onDeposit={(amount) => depositMutation.mutate(amount)}
            isPending={isPending}
          />
          <AvailableToBorrowCard
            // HOLLAR is $-pegged → availableUsd ≈ availableHollar.
            // Total credit line = currently borrowed + headroom remaining.
            availableHollar={poolPosition?.availableBorrowsUsd ?? 0}
            availableUsd={poolPosition?.availableBorrowsUsd ?? 0}
            totalCreditUsd={
              (poolPosition?.availableBorrowsUsd ?? 0) +
              (poolPosition?.totalDebtUsd ?? 0)
            }
            onBorrow={() => setShowBorrow(true)}
            disabled={!poolPosition?.hasCollateral}
          />
        </Flex>
      </Grid>

      <WithdrawModal
        open={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        vaultStats={stats}
        hdclBalance={
          withdrawSource === "raw"
            ? (userBalances.hdclRaw ?? 0)
            : (userBalances.hdclSupplied ?? 0)
        }
        onRequestRedeem={(amount) => {
          if (withdrawSource === "raw") redeemRawMutation.mutate(amount)
          else redeemMutation.mutate(amount)
          setShowWithdraw(false)
        }}
        onInstantRedeem={(amount) => {
          instantRedeemMutation.mutate(amount)
          setShowWithdraw(false)
        }}
        instantAvailable={true}
        isPending={isPending}
      />

      <BorrowHollarModal
        open={showBorrow}
        onClose={() => setShowBorrow(false)}
        poolPosition={poolPosition}
        onBorrow={(amount) => {
          borrowMutation.mutate(amount)
          setShowBorrow(false)
        }}
        isPending={isPending}
      />
    </Flex>
  )
}
