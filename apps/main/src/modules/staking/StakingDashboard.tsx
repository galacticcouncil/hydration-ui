import { Box, Grid, Paper, SectionHeader } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { uniquesIds } from "@/api/constants"
import { accountOpenGovVotesQuery } from "@/api/democracy"
import { stakingPositionsQuery } from "@/api/staking"
import { ActiveDashboard } from "@/modules/staking/ActiveDashboard"
import { DashboardStats } from "@/modules/staking/DashboardStats"
import { HowToStake } from "@/modules/staking/HowToStake"
import { OngoingReferenda } from "@/modules/staking/OngoingReferenda"
import { Stake } from "@/modules/staking/Stake"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

// TODO integrate
const staked = "10002"
const stakeBalance = "10"

export const StakingDashboard: FC = () => {
  const { t } = useTranslation("staking")
  const rpc = useRpcProvider()

  const { native } = useAssets()
  const { account } = useAccount()
  const address = account?.address ?? ""

  const { data: uniquesData, isLoading: uniquesLoading } = useQuery(
    uniquesIds(rpc),
  )
  const stakingId = uniquesData?.stakingId ?? 0n

  const { data: stakingPositionsData, isLoading: stakingPositionsLoading } =
    useQuery(stakingPositionsQuery(rpc, address, stakingId))

  const {
    data: votesData = [],
    isLoading: votesIsLoading,
    isSuccess: votesIsSuccess,
  } = useQuery(accountOpenGovVotesQuery(rpc, address))

  const minStake = scaleHuman(
    stakingPositionsData?.stake ?? 0n,
    native.decimals,
  )

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
        <Stake
          minStake={minStake}
          staked={staked}
          votes={votesData}
          positionId={stakingPositionsData?.stakePositionId ?? 0n}
          votesSuccess={votesIsSuccess}
          balance={stakeBalance}
          isLoading={
            votesIsLoading || stakingPositionsLoading || uniquesLoading
          }
        />
      </Grid>
      <OngoingReferenda votes={votesData} isVotesLoading={votesIsLoading} />
    </Box>
  )
}
