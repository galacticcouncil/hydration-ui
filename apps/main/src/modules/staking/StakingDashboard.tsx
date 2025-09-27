import { Box, Grid, Paper, SectionHeader } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { ActiveDashboard } from "@/modules/staking/ActiveDashboard"
import { DashboardStats } from "@/modules/staking/DashboardStats"
import { HowToStake } from "@/modules/staking/HowToStake"
import { OngoingReferenda } from "@/modules/staking/OngoingReferenda"
import { Stake } from "@/modules/staking/Stake"

export const StakingDashboard: FC = () => {
  const { t } = useTranslation("staking")
  const { account } = useAccount()

  return (
    <Box>
      <SectionHeader>{t("dashboard.title")}</SectionHeader>
      <Grid
        columnTemplate="1fr auto"
        align="start"
        gap={30}
        pb={getTokenPx("scales.paddings.xxl")}
      >
        <Paper maxWidth={640}>
          {account ? <ActiveDashboard /> : <HowToStake />}
          <DashboardStats />
        </Paper>
        <Stake />
      </Grid>
      <SectionHeader>{t("referenda.title")}</SectionHeader>
      <OngoingReferenda />
    </Box>
  )
}
