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
  usePropellerApy,
  useUserBalances,
  useVaultStats,
} from "@/modules/strategies/propeller/hooks/useVaultReads"
import {
  useClaim,
  useDeposit,
  useRequestRedeem,
} from "@/modules/strategies/propeller/hooks/useVaultWrites"
import { PropellerVaultProvider } from "@/modules/strategies/propeller/PropellerVaultContext"
import {
  DEFAULT_PROPELLER_ASSET,
  getPropellerVault,
  type PropellerAsset,
} from "@/modules/strategies/propeller/vaults"

/**
 * The single shared Propeller subpage. All collateral vaults (ETH, tBTC, …) live
 * here; the active one is local state driven by the in-header collateral switcher
 * and supplied to every read/write hook via PropellerVaultProvider. The content
 * is keyed on `asset` so a switch cleanly remounts (resets transient UI state and
 * re-queries against the new vault).
 */
export const PropellerVaultPage = () => {
  const [asset, setAsset] = useState<PropellerAsset>(DEFAULT_PROPELLER_ASSET)

  return (
    <PropellerVaultProvider vault={getPropellerVault(asset)}>
      <PropellerVaultContent
        key={asset}
        asset={asset}
        onAssetChange={setAsset}
      />
    </PropellerVaultProvider>
  )
}

type ContentProps = {
  asset: PropellerAsset
  onAssetChange: (asset: PropellerAsset) => void
}

const PropellerVaultContent = ({ asset, onAssetChange }: ContentProps) => {
  const { account } = useAccount()
  const [showRedeemed, setShowRedeemed] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)

  const address = account?.address ?? ""
  const evmAddress = address
    ? (safeConvertSS58toH160(address) as Hex)
    : undefined

  const { data: vaultStats } = useVaultStats()
  const apy = usePropellerApy()
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
      <StrategyHeader asset={asset} onAssetChange={onAssetChange} />

      <TwoColumnGrid template="sidebar">
        <Stack gap="xl" sx={{ order: [1, null, 0] }}>
          {hasPositions && (
            <MyPositionsCard
              shares={userBalances.shares}
              exchangeRate={stats.exchangeRate}
              apy={apy}
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
