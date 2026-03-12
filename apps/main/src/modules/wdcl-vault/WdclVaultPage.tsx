import { Flex, Grid } from "@galacticcouncil/ui/components"
import { safeConvertSS58toH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useState } from "react"
import { type Hex } from "viem"

import { History } from "./components/History"
import { MyWithdrawals } from "./components/MyWithdrawals"
import { OverviewPanel } from "./components/OverviewPanel"
import { PositionsModal } from "./components/PositionsModal"
import { QueueModal } from "./components/QueueModal"
import { WithdrawalsSummary } from "./components/WithdrawalsSummary"
import { useHollarAllowance, useUserBalances, useVaultStats } from "./hooks/useVaultReads"
import { useApproveHollar, useCancelRedeem, useDeposit, useRequestRedeem } from "./hooks/useVaultWrites"
import { usePositions } from "./hooks/usePositions"
import { useRedemptionQueue } from "./hooks/useRedemptionQueue"

export const WdclVaultPage = () => {
  const { account } = useAccount()
  const [showQueue, setShowQueue] = useState(false)
  const [showPositions, setShowPositions] = useState(false)
  const [showMyWithdrawals, setShowMyWithdrawals] = useState(true)

  // Derive EVM address from Substrate account
  const address = account?.address ?? ""
  const evmAddress = address ? (safeConvertSS58toH160(address) as Hex) : undefined

  // Contract reads
  const { data: vaultStats } = useVaultStats()
  const { data: balances } = useUserBalances(evmAddress)
  const { data: allowanceData } = useHollarAllowance(evmAddress)
  const { data: queueData } = useRedemptionQueue(evmAddress)
  const { data: positions } = usePositions()

  // Contract writes
  const approveMutation = useApproveHollar()
  const depositMutation = useDeposit()
  const redeemMutation = useRequestRedeem()
  const cancelMutation = useCancelRedeem()

  const isPending = approveMutation.isPending || depositMutation.isPending || redeemMutation.isPending

  // Defaults
  const stats = vaultStats ?? {
    totalAssets: 0,
    totalSupply: 0,
    exchangeRate: 1,
    withdrawalDelayDays: 0,
    investmentPeriodDays: 0,
    tvlCap: 0,
    paused: false,
    depositsPaused: false,
    minDeposit: 10,
    apr: 18,
  }

  const userBalances = balances ?? { hollar: 0, wdcl: 0 }
  const allowance = allowanceData ?? 0
  const queue = queueData?.queue ?? []
  const myWithdrawals = queueData?.myWithdrawals ?? []
  const totalQueuedWdcl = queueData?.totalQueuedWdcl ?? 0
  const positionsList = positions ?? []

  return (
    <>
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
        {/* Left column */}
        <Flex direction="column" gap={20}>
          <WithdrawalsSummary
            myWithdrawalsHollar={myWithdrawals.reduce((s, w) => s + w.estHollar, 0)}
            totalWithdrawalsHollar={totalQueuedWdcl * stats.exchangeRate}
            onToggleMyWithdrawals={() => setShowMyWithdrawals(!showMyWithdrawals)}
            onShowQueue={() => setShowQueue(true)}
          />

          {showMyWithdrawals && (
            <MyWithdrawals
              withdrawals={myWithdrawals}
              exchangeRate={stats.exchangeRate}
              apr={stats.apr}
              onCancelRedeem={(id) => cancelMutation.mutate(id)}
              isCancelling={cancelMutation.isPending}
            />
          )}

          <History history={[]} />
        </Flex>

        {/* Right column */}
        <OverviewPanel
          vaultStats={stats}
          balances={userBalances}
          allowance={allowance}
          onShowPositions={() => setShowPositions(true)}
          onDeposit={(amount) => depositMutation.mutate(amount)}
          onRequestRedeem={(amount) => redeemMutation.mutate(amount)}
          onApprove={(amount) => approveMutation.mutate(amount)}
          isPending={isPending}
        />
      </Grid>

      {/* Modals */}
      {showQueue && (
        <QueueModal queue={queue} onClose={() => setShowQueue(false)} />
      )}
      {showPositions && (
        <PositionsModal positions={positionsList} onClose={() => setShowPositions(false)} />
      )}
    </>
  )
}
