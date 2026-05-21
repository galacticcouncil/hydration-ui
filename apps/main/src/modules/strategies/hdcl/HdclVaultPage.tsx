import { Stack } from "@galacticcouncil/ui/components"
import { safeConvertSS58toH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useState } from "react"
import { type Hex, parseUnits } from "viem"

import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid/TwoColumnGrid"
import { AboutCard } from "@/modules/strategies/hdcl/components/AboutCard"
import { BorrowHollarModal } from "@/modules/strategies/hdcl/components/BorrowHollarModal"
import { DepositPanel } from "@/modules/strategies/hdcl/components/DepositPanel"
import { MyBorrowsCard } from "@/modules/strategies/hdcl/components/MyBorrowsCard"
import { MyPositionsCard } from "@/modules/strategies/hdcl/components/MyPositionsCard"
import { RepayHollarModal } from "@/modules/strategies/hdcl/components/RepayHollarModal"
import { StrategyDetailsCard } from "@/modules/strategies/hdcl/components/StrategyDetailsCard"
import { StrategyHeader } from "@/modules/strategies/hdcl/components/StrategyHeader"
import type {
  WithdrawalRow,
  WithdrawalRowState,
} from "@/modules/strategies/hdcl/components/Withdrawals.columns"
import { WithdrawalsCard } from "@/modules/strategies/hdcl/components/WithdrawalsCard"
import { WithdrawModal } from "@/modules/strategies/hdcl/components/WithdrawModal"
import { HDCL_HAS_AAVE_LAYER } from "@/modules/strategies/hdcl/constants"
import { useHdclPoolPosition } from "@/modules/strategies/hdcl/hooks/useHdclPoolPosition"
import {
  useBorrowHollar,
  useRepayHollar,
} from "@/modules/strategies/hdcl/hooks/useHdclPoolWrites"
import { useRedemptionHistory } from "@/modules/strategies/hdcl/hooks/useRedemptionHistory"
import { useRedemptionQueue } from "@/modules/strategies/hdcl/hooks/useRedemptionQueue"
import { useInstantRedeem } from "@/modules/strategies/hdcl/hooks/useStableswap"
import {
  useAutoClaimEnabled,
  useUserBalances,
  useVaultStats,
} from "@/modules/strategies/hdcl/hooks/useVaultReads"
import {
  useCancelRedeem,
  useClaim,
  useDeposit,
  useRequestRedeem,
  useRequestRedeemRaw,
  useSetAutoClaim,
  useSupplyRawHdcl,
} from "@/modules/strategies/hdcl/hooks/useVaultWrites"

export const HdclVaultPage = () => {
  const { account } = useAccount()
  const [showRedeemed, setShowRedeemed] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [showBorrow, setShowBorrow] = useState(false)
  const [showRepay, setShowRepay] = useState(false)
  const [withdrawSource, setWithdrawSource] = useState<"supplied" | "raw">(
    "supplied",
  )

  const address = account?.address ?? ""
  const evmAddress = address
    ? (safeConvertSS58toH160(address) as Hex)
    : undefined

  const { data: vaultStats } = useVaultStats()
  const { data: balances } = useUserBalances(evmAddress)
  const { data: queueData } = useRedemptionQueue(evmAddress)
  const { data: historyData } = useRedemptionHistory(evmAddress)
  const { data: poolPosition } = useHdclPoolPosition(evmAddress)

  console.log({ poolPosition, vaultStats })

  const depositMutation = useDeposit()
  const redeemMutation = useRequestRedeem()
  const redeemRawMutation = useRequestRedeemRaw()
  const supplyRawMutation = useSupplyRawHdcl()
  const cancelMutation = useCancelRedeem()
  const claimMutation = useClaim()
  const setAutoClaimMutation = useSetAutoClaim()
  const borrowMutation = useBorrowHollar()
  const repayMutation = useRepayHollar()
  const instantRedeemMutation = useInstantRedeem()

  const { data: autoClaimOn } = useAutoClaimEnabled(evmAddress)

  const isPending =
    depositMutation.isPending ||
    redeemMutation.isPending ||
    redeemRawMutation.isPending ||
    supplyRawMutation.isPending ||
    borrowMutation.isPending ||
    repayMutation.isPending ||
    instantRedeemMutation.isPending

  const stats = vaultStats ?? {
    totalAssets: 0,
    totalSupply: 0,
    exchangeRate: 1,
    worstCaseWaitDays: 0,
    nextMaturityDays: 0,
    maxLockupDays: 62,
    tvlCap: 0,
    paused: false,
    depositsPaused: false,
    minDeposit: 10,
    minRedeem: 1,
    apr: 18,
  }

  const userBalances = balances ?? {
    hollar: 0,
    hdcl: 0,
    hdclRaw: 0,
    hdclSupplied: 0,
  }
  const queue = queueData?.queue ?? []

  // Build the unified withdrawal-rows model. See HdclVaultPage history pre-rework
  // for full notes — queue is the primary source, history merges in timestamps
  // and is the only source for completed rows.
  const historyByReqId = new Map(
    (historyData ?? []).map((h) => [h.requestId, h]),
  )

  const activeRows: WithdrawalRow[] = queue
    .filter((e) => e.isUser)
    .map((e) => {
      const h = historyByReqId.get(e.requestId)
      const isStillActive =
        h?.state === "partial" || h?.state === "pending" || !h
      const state: WithdrawalRowState = isStillActive
        ? (h?.state ?? "pending")
        : "pending"
      return {
        id: e.requestId,
        amountHdcl: e.hdclRemaining,
        estHollar: e.hdclRemaining * stats.exchangeRate,
        requestedDate: h?.requestedAt ?? new Date(0),
        state,
        timeRemainingDays: e.estTimeRemainingDays,
        fulfilledDate: h?.fulfilledAt ?? undefined,
        // Surfaced from the queue read — drives the per-row Claim button.
        claimableHdcl: e.hdclSettled,
        claimableHollar: e.hollarOwed,
      }
    })

  const activeIds = new Set(activeRows.map((r) => r.id))
  const completedRows: WithdrawalRow[] = (historyData ?? [])
    .filter(
      (h) =>
        !activeIds.has(h.requestId) &&
        (h.state === "fulfilled" || h.state === "cancelled"),
    )
    .map((h) => ({
      id: h.requestId,
      amountHdcl: h.state === "fulfilled" ? h.hdclFulfilled : h.hdclRequested,
      estHollar:
        h.state === "fulfilled"
          ? h.hollarReceived
          : h.hdclRequested * stats.exchangeRate,
      requestedDate: h.requestedAt,
      state: h.state,
      fulfilledDate: h.fulfilledAt ?? undefined,
    }))

  const withdrawalRows: WithdrawalRow[] = [...activeRows, ...completedRows]

  // Net worth in USD = collateral USD - debt USD. Used for the "Net worth /
  // after borrow" cell in the positions table.
  const collateralUsd = poolPosition?.totalCollateralUsd ?? 0
  const debtUsd = poolPosition?.totalDebtUsd ?? 0
  const netWorthUsd = Math.max(0, collateralUsd - debtUsd)

  const handleWithdrawSupplied = () => {
    setWithdrawSource("supplied")
    setShowWithdraw(true)
  }
  const handleWithdrawRaw = () => {
    setWithdrawSource("raw")
    setShowWithdraw(true)
  }
  const handleWithdrawByRow = (id: "supplied" | "raw") => {
    if (id === "raw") handleWithdrawRaw()
    else handleWithdrawSupplied()
  }

  return (
    <Stack gap="xxl">
      <StrategyHeader />

      <TwoColumnGrid template="sidebar">
        <Stack gap="xl" sx={{ order: [1, null, 0] }}>
          <MyPositionsCard
            hdclSupplied={userBalances.hdclSupplied ?? 0}
            hdclRaw={userBalances.hdclRaw ?? 0}
            exchangeRate={stats.exchangeRate}
            apyPercent={stats.apr}
            netWorthUsd={netWorthUsd}
            minDisplayBalance={stats.minRedeem}
            onWithdraw={handleWithdrawByRow}
            onDepositRaw={() =>
              supplyRawMutation.mutate(userBalances.hdclRaw ?? 0)
            }
            isDepositingRaw={supplyRawMutation.isPending}
          />

          <MyBorrowsCard
            poolPosition={poolPosition}
            // No on-chain Borrow APY read on the HDCL pool yet — surface a
            // best-effort static value from STRATEGY config until a real
            // reserve-data hook lands. Display-only.
            borrowApyPercent={4.5}
            onBorrow={() => setShowBorrow(true)}
            onRepay={() => setShowRepay(true)}
          />

          <WithdrawalsCard
            rows={withdrawalRows}
            showRedeemed={showRedeemed}
            onShowRedeemedChange={setShowRedeemed}
            onCancel={(id) => cancelMutation.mutate(id)}
            isCancelling={cancelMutation.isPending}
            onClaim={(claimableHdcl) => {
              // useClaim takes shares in wei (bigint). The row carries a
              // human-scaled number from `formatUnits(..., 18)`; round-trip
              // back via parseUnits to avoid FP edge cases at low decimals.
              const shares = parseUnits(claimableHdcl.toString(), 18)
              claimMutation.mutate(shares)
            }}
            isClaiming={claimMutation.isPending}
            autoClaimEnabled={autoClaimOn ?? false}
            onAutoClaimChange={(next) => setAutoClaimMutation.mutate(next)}
            isAutoClaimUpdating={setAutoClaimMutation.isPending}
          />

          <StrategyDetailsCard vaultStats={stats} />

          <AboutCard />
        </Stack>

        <DepositPanel
          vaultStats={stats}
          balances={userBalances}
          onDeposit={(amount) => depositMutation.mutate(amount)}
          isPending={isPending}
        />
      </TwoColumnGrid>

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
        // Instant redeem depends on the HDCL/HOLLAR stableswap pool, which
        // depends on aHDCL — only available once the Aave layer is live.
        instantAvailable={HDCL_HAS_AAVE_LAYER}
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

      <RepayHollarModal
        open={showRepay}
        onClose={() => setShowRepay(false)}
        poolPosition={poolPosition}
        walletHollar={userBalances.hollar}
        onRepay={(amount) => {
          repayMutation.mutate(amount)
          setShowRepay(false)
        }}
        isPending={isPending}
      />
    </Stack>
  )
}
