import {
  Alert,
  Paper,
  Stack,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { safeConvertSS58toH160 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { Navigate, useSearch } from "@tanstack/react-router"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { type Hex } from "viem"

import { AppSkeleton } from "@/modules/layout/components/LayoutSkeleton"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid/TwoColumnGrid"
import { AboutCard } from "@/modules/strategies/juicer/components/AboutCard"
import { DepositForm } from "@/modules/strategies/juicer/components/DepositForm"
import { MyPositionsCard } from "@/modules/strategies/juicer/components/MyPositionsCard"
import { StrategyDetailsCard } from "@/modules/strategies/juicer/components/StrategyDetailsCard"
import { StrategyHeader } from "@/modules/strategies/juicer/components/StrategyHeader"
import { WithdrawalsCard } from "@/modules/strategies/juicer/components/WithdrawalsCard"
import { WithdrawModal } from "@/modules/strategies/juicer/components/WithdrawModal"
import { type JuicerVaultConfig } from "@/modules/strategies/juicer/config/vaults"
import { useDefaultDepositVault } from "@/modules/strategies/juicer/hooks/useDefaultDepositVault"
import { useIceDepositTracker } from "@/modules/strategies/juicer/hooks/useIceDeposit"
import { useJuicerAccount } from "@/modules/strategies/juicer/hooks/useJuicerAccount"
import { useRefetchOnWake } from "@/modules/strategies/juicer/hooks/useRefetchOnWake"
import { useRpcProvider } from "@/providers/rpcProvider"

export const JuicerVaultPage: FC = () => {
  const { featureFlags, isReady } = useRpcProvider()

  if (isReady && !featureFlags.juicerEnabled) {
    return <Navigate to="/strategies" />
  }

  return <JuicerVaultContent />
}

const JuicerVaultContent = () => {
  const { t } = useTranslation("juicer")
  const { account } = useAccount()
  const [withdrawVault, setWithdrawVault] = useState<JuicerVaultConfig | null>(
    null,
  )

  const address = account?.address ?? ""
  const evmAddress = address
    ? (safeConvertSS58toH160(address) as Hex)
    : undefined

  const { positions, withdrawals, isError } = useJuicerAccount(evmAddress)
  useRefetchOnWake()
  const iceDeposits = useIceDepositTracker().filter((d) => d.owner === address)

  const defaultDeposit = useDefaultDepositVault()

  // below md the grid stacks into one column, so the page splits into tabs
  const { gte } = useBreakpoints()
  const stacked = !gte("md")
  // a portfolio Claim opens the page at Withdrawals, which lives in this tab
  const { section } = useSearch({ from: "/strategies/juicer/" })
  const [tab, setTab] = useState<"overview" | "positions">(
    section === "withdrawals" ? "positions" : "overview",
  )
  const hasUserData =
    positions.length > 0 || withdrawals.length > 0 || iceDeposits.length > 0
  const showOverview = !stacked || !hasUserData || tab === "overview"
  const showPositions = !stacked || (hasUserData && tab === "positions")

  return (
    <Stack gap="xl">
      <StrategyHeader />
      {isError && (
        <Alert variant="warning" description={t("positions.readFailed")} />
      )}

      {stacked && hasUserData && (
        <ToggleGroup
          type="single"
          fullWidth
          value={tab}
          onValueChange={(value) => value && setTab(value)}
        >
          <ToggleGroupItem value="overview">
            {t("tab.overview")}
          </ToggleGroupItem>
          <ToggleGroupItem value="positions">
            {t("tab.myPositions")}
          </ToggleGroupItem>
        </ToggleGroup>
      )}
      <TwoColumnGrid template="sidebar">
        <Stack
          gap="xl"
          minWidth={0}
          sx={{ order: [showOverview ? 1 : 0, null, 0] }}
        >
          {showPositions && (
            <MyPositionsCard
              positions={positions}
              iceDeposits={iceDeposits}
              onWithdraw={setWithdrawVault}
            />
          )}

          {showOverview && (
            <>
              <StrategyDetailsCard />
              <AboutCard />
            </>
          )}
        </Stack>

        <Stack gap="xl" minWidth={0}>
          {showOverview &&
            (defaultDeposit.deposit ? (
              <Paper px="xl" position="relative">
                <DepositForm
                  key={`${defaultDeposit.deposit.vault.vaultAddress}:${defaultDeposit.deposit.assetId}`}
                  initialDeposit={defaultDeposit.deposit}
                  onSelect={defaultDeposit.markUserPick}
                />
              </Paper>
            ) : (
              defaultDeposit.isLoading && <AppSkeleton />
            ))}
          {showPositions && <WithdrawalsCard rows={withdrawals} />}
        </Stack>
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
