import { Stack } from "@galacticcouncil/ui/components"
import { Navigate } from "@tanstack/react-router"

import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid/TwoColumnGrid"
import { AboutCard } from "@/modules/strategies/bil/components/AboutCard"
import { BilDeposit } from "@/modules/strategies/bil/components/BilDeposit"
import { MyBorrowsCard } from "@/modules/strategies/bil/components/MyBorrowsCard"
import { MyPositionsCard } from "@/modules/strategies/bil/components/MyPositionsCard"
import { StrategyDetailsCard } from "@/modules/strategies/bil/components/StrategyDetailsCard"
import { StrategyHeader } from "@/modules/strategies/bil/components/StrategyHeader"
import { WithdrawalsCard } from "@/modules/strategies/bil/components/WithdrawalsCard"
import { BilStrategyProvider } from "@/modules/strategies/bil/context/BilStrategyContext"
import { useRpcProvider } from "@/providers/rpcProvider"

export const BilVaultPage = () => {
  const { featureFlags, isLoaded } = useRpcProvider()

  if (isLoaded && !featureFlags.bilEnabled) {
    return <Navigate to="/strategies" />
  }

  return (
    <BilStrategyProvider>
      <Stack gap="xxl">
        <StrategyHeader />

        <TwoColumnGrid template="sidebar">
          <Stack gap="xl" sx={{ order: [1, null, 0] }}>
            <MyPositionsCard />

            <MyBorrowsCard />

            <WithdrawalsCard />

            <StrategyDetailsCard />

            <AboutCard />
          </Stack>

          <BilDeposit />
        </TwoColumnGrid>
      </Stack>
    </BilStrategyProvider>
  )
}
