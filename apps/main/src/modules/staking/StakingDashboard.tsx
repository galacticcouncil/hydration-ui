import {
  Box,
  Flex,
  Grid,
  Paper,
  SectionHeader,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { bigMax } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { nativeTokenLocksQuery, TokenLockType } from "@/api/balances"
import { uniquesIds } from "@/api/constants"
import { accountOpenGovVotesQuery } from "@/api/democracy"
import { stakingPositionsQuery } from "@/api/staking"
import { ActiveDashboard } from "@/modules/staking/ActiveDashboard"
import { ActiveDashboardSkeleton } from "@/modules/staking/ActiveDashboardSkeleton"
import { DashboardStats } from "@/modules/staking/DashboardStats"
import { DashboardStatsSkeleton } from "@/modules/staking/DashboardStatsSkeleton"
import { HowToStake } from "@/modules/staking/HowToStake"
import { OngoingReferenda } from "@/modules/staking/OngoingReferenda"
import { Stake } from "@/modules/staking/Stake"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

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

  const { data: stakingPositionsData, isPending: stakingPositionsPending } =
    useQuery(stakingPositionsQuery(rpc, address, stakingId))

  const {
    data: votesData = [],
    isLoading: votesIsLoading,
    isSuccess: votesIsSuccess,
  } = useQuery(accountOpenGovVotesQuery(rpc, address))

  const staked = scaleHuman(stakingPositionsData?.stake ?? 0n, native.decimals)

  const positionId = stakingPositionsData?.stakePositionId ?? 0n
  const hasPosition = !!positionId

  const { getBalance } = useAccountBalances()

  const { data: locksData = [], isLoading: locksLoading } = useQuery(
    nativeTokenLocksQuery(rpc, address),
  )

  const vested = locksData
    .reduce(
      (acc, lock) =>
        lock.type === TokenLockType.Vesting ? acc.plus(lock.amount) : acc,
      Big(0),
    )
    .toString()

  const rawAvailableBalance = Big(getBalance(native.id)?.free.toString() || "0")
    .minus(vested)
    .minus(stakingPositionsData?.stake?.toString() || "0")
    .minus(stakingPositionsData?.accumulated_locked_rewards?.toString() || "0")

  const availableBalance = scaleHuman(
    bigMax(0, rawAvailableBalance).toString(),
    native.decimals,
  )

  const { isMobile } = useBreakpoints()

  const isLoading = !!account && stakingPositionsPending

  if (isMobile) {
    return (
      <Flex direction="column" gap={10}>
        <OngoingReferenda votes={votesData} isVotesLoading={votesIsLoading} />
        <Flex direction="column" gap={20}>
          <Box>
            <SectionHeader>{t("dashboard.title")}</SectionHeader>
            <Stake
              key={address}
              staked={staked}
              votes={votesData}
              positionId={stakingPositionsData?.stakePositionId ?? 0n}
              votesSuccess={votesIsSuccess}
              balance={availableBalance}
              isLoading={
                votesIsLoading || isLoading || uniquesLoading || locksLoading
              }
            />
          </Box>
          <Paper px={12} py={getTokenPx("containers.paddings.primary")}>
            {isLoading ? (
              <>
                <ActiveDashboardSkeleton />
                <DashboardStatsSkeleton />
              </>
            ) : (
              <>
                {hasPosition ? (
                  <ActiveDashboard
                    positionId={positionId}
                    votes={votesData}
                    votesSuccess={votesIsSuccess}
                  />
                ) : (
                  <HowToStake />
                )}
                <DashboardStats
                  positionId={positionId}
                  staked={staked}
                  isStakeLoading={isLoading}
                />
              </>
            )}
          </Paper>
        </Flex>
      </Flex>
    )
  }

  return (
    <Box>
      <SectionHeader>{t("dashboard.title")}</SectionHeader>
      <Grid
        columnTemplate="minmax(min-content, 640px) minmax(min-content, 1fr)"
        align="start"
        gap={30}
        pb={getTokenPx("scales.paddings.xxl")}
      >
        <Paper>
          {isLoading ? (
            <>
              <ActiveDashboardSkeleton />
              <DashboardStatsSkeleton />
            </>
          ) : (
            <>
              {hasPosition ? (
                <ActiveDashboard
                  positionId={positionId}
                  votes={votesData}
                  votesSuccess={votesIsSuccess}
                />
              ) : (
                <HowToStake />
              )}
              <DashboardStats
                positionId={positionId}
                staked={staked}
                isStakeLoading={isLoading}
              />
            </>
          )}
        </Paper>
        <Stake
          key={address}
          staked={staked}
          votes={votesData}
          positionId={positionId}
          votesSuccess={votesIsSuccess}
          balance={availableBalance}
          isLoading={
            votesIsLoading || isLoading || uniquesLoading || locksLoading
          }
        />
      </Grid>
      <OngoingReferenda votes={votesData} isVotesLoading={votesIsLoading} />
    </Box>
  )
}
