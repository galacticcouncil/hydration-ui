import { Stack } from "@galacticcouncil/ui/components"
import { safeConvertSS58toH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useState } from "react"
import { type Hex } from "viem"

import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid/TwoColumnGrid"
import { AboutCard } from "@/modules/strategies/propeller/components/AboutCard"
import { DepositPanel } from "@/modules/strategies/propeller/components/DepositPanel"
import { MyPositionsCard } from "@/modules/strategies/propeller/components/MyPositionsCard"
import { StrategyDetailsCard } from "@/modules/strategies/propeller/components/StrategyDetailsCard"
import { StrategyHeader } from "@/modules/strategies/propeller/components/StrategyHeader"
import type { WithdrawalRow } from "@/modules/strategies/propeller/components/Withdrawals.columns"
import { WithdrawalsCard } from "@/modules/strategies/propeller/components/WithdrawalsCard"
import { WithdrawModal } from "@/modules/strategies/propeller/components/WithdrawModal"
import { useRedemptionHistory } from "@/modules/strategies/propeller/hooks/useRedemptionHistory"
import { useRedemptionQueue } from "@/modules/strategies/propeller/hooks/useRedemptionQueue"
import {
  useUserBalances,
  useVaultStats,
} from "@/modules/strategies/propeller/hooks/useVaultReads"
import {
  useClaim,
  useDeposit,
  useRequestRedeem,
} from "@/modules/strategies/propeller/hooks/useVaultWrites"

export const PropellerVaultPage = () => {
  const { account } = useAccount()
  const [showRedeemed, setShowRedeemed] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)

  const address = account?.address ?? ""
  const evmAddress = address
    ? (safeConvertSS58toH160(address) as Hex)
    : undefined

  const { data: vaultStats } = useVaultStats()
  const { data: balances } = useUserBalances(evmAddress)
  const { data: queueData } = useRedemptionQueue(evmAddress)
  const { data: historyData } = useRedemptionHistory(evmAddress)

  const depositMutation = useDeposit()
  const redeemMutation = useRequestRedeem()
  const claimMutation = useClaim()

  const isPending =
    depositMutation.isPending ||
    redeemMutation.isPending ||
    claimMutation.isPending

  const stats = vaultStats ?? {
    totalAssets: 0,
    totalSupply: 0,
    exchangeRate: 1,
    queueLength: 0,
    tvlCap: 0,
    paused: false,
    depositsPaused: false,
    minDeposit: 0,
    minRedeem: 0,
    apr: 0,
  }

  const userBalances = balances ?? { eth: 0, shares: 0 }
  const queue = queueData?.queue ?? []

  // Build the unified withdrawal-rows model. The live queue is the primary
  // source for active/settled state; history supplies request timestamps and
  // is the only source for claimed rows (settled+claimed slots leave the
  // queue once the head advances past them).
  const historyByReqId = new Map(
    (historyData ?? []).map((h) => [h.requestId, h]),
  )

  const activeRows: WithdrawalRow[] = queue
    .filter((e) => e.isUser)
    .map((e) => {
      const h = historyByReqId.get(e.requestId)
      // active=false with settled collateral means it's claimable.
      const state: WithdrawalRow["state"] = e.active ? "pending" : "settled"
      return {
        id: e.requestId,
        amountShares: e.shares,
        estEth:
          e.collateralOwed > 0
            ? e.collateralOwed
            : e.shares * stats.exchangeRate,
        requestedDate: h?.requestedAt ?? new Date(0),
        state,
        settledDate: h?.settledAt ?? undefined,
        claimableEth: e.collateralSettled,
      }
    })

  const activeIds = new Set(activeRows.map((r) => r.id))
  const completedRows: WithdrawalRow[] = (historyData ?? [])
    .filter((h) => !activeIds.has(h.requestId) && h.state === "claimed")
    .map((h) => ({
      id: h.requestId,
      amountShares: h.shares,
      estEth: h.collateralClaimed,
      requestedDate: h.requestedAt,
      state: "claimed",
      settledDate: h.settledAt ?? undefined,
      claimedDate: h.claimedAt ?? undefined,
    }))

  const withdrawalRows: WithdrawalRow[] = [...activeRows, ...completedRows]

  const hasPositions = userBalances.shares > 0

  return (
    <Stack gap="xxl">
      <StrategyHeader />

      <TwoColumnGrid template="sidebar">
        <Stack gap="xl" sx={{ order: [1, null, 0] }}>
          {hasPositions && (
            <MyPositionsCard
              shares={userBalances.shares}
              exchangeRate={stats.exchangeRate}
              apyPercent={stats.apr}
              onWithdraw={() => setShowWithdraw(true)}
            />
          )}

          <WithdrawalsCard
            rows={withdrawalRows}
            showRedeemed={showRedeemed}
            onShowRedeemedChange={setShowRedeemed}
            onClaim={(requestId) => claimMutation.mutate(requestId)}
            isClaiming={claimMutation.isPending}
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
        shareBalance={userBalances.shares}
        onRequestRedeem={(amount) => {
          redeemMutation.mutate(amount)
          setShowWithdraw(false)
        }}
        isPending={isPending}
      />
    </Stack>
  )
}
