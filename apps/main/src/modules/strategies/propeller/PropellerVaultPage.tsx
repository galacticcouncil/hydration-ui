import { Paper, Stack } from "@galacticcouncil/ui/components"
import { safeConvertSS58toH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { Navigate } from "@tanstack/react-router"
import { useState } from "react"
import { type Hex } from "viem"

import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid/TwoColumnGrid"
import { AboutCard } from "@/modules/strategies/propeller/components/AboutCard"
import { DepositForm } from "@/modules/strategies/propeller/components/DepositForm"
import { MyPositionsCard } from "@/modules/strategies/propeller/components/MyPositionsCard"
import { StrategyDetailsCard } from "@/modules/strategies/propeller/components/StrategyDetailsCard"
import { StrategyHeader } from "@/modules/strategies/propeller/components/StrategyHeader"
import { WithdrawalsCard } from "@/modules/strategies/propeller/components/WithdrawalsCard"
import { WithdrawModal } from "@/modules/strategies/propeller/components/WithdrawModal"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import { useDefaultDepositVault } from "@/modules/strategies/propeller/hooks/useDefaultDepositVault"
import { usePropellerAccount } from "@/modules/strategies/propeller/hooks/usePropellerAccount"
import { useRpcProvider } from "@/providers/rpcProvider"

export const PropellerVaultPage = () => {
  const { featureFlags, isReady } = useRpcProvider()

  if (isReady && !featureFlags.propellerEnabled) {
    return <Navigate to="/strategies" />
  }

  return <PropellerVaultContent />
}

const PropellerVaultContent = () => {
  const { account } = useAccount()
  const [withdrawVault, setWithdrawVault] =
    useState<PropellerVaultConfig | null>(null)

  const address = account?.address ?? ""
  const evmAddress = address
    ? (safeConvertSS58toH160(address) as Hex)
    : undefined

  const { positions, withdrawals } = usePropellerAccount(evmAddress)

  const defaultDeposit = useDefaultDepositVault()

  return (
    <Stack gap="xxl">
      <StrategyHeader />

      <TwoColumnGrid template="sidebar">
        <Stack gap="xl" sx={{ order: [1, null, 0] }}>
          <MyPositionsCard
            positions={positions}
            onWithdraw={setWithdrawVault}
          />

          <WithdrawalsCard rows={withdrawals} />

          <StrategyDetailsCard />

          <AboutCard />
        </Stack>

        {defaultDeposit.vault && (
          <Paper px="xl">
            <DepositForm
              key={defaultDeposit.vault.vaultAddress}
              initialVault={defaultDeposit.vault}
              onVaultChange={defaultDeposit.markUserPick}
            />
          </Paper>
        )}
      </TwoColumnGrid>

      {withdrawVault && (
        <WithdrawModal
          vault={withdrawVault}
          open
          onClose={() => setWithdrawVault(null)}
        />
      )}
    </Stack>
  )
}
