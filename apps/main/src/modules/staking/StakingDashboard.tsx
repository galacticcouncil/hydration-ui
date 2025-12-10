import {
  Box,
  Flex,
  Grid,
  Paper,
  SectionHeader,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getTokenPx } from "@galacticcouncil/ui/utils"
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
import { toDecimal } from "@/utils/formatting"

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

  const staked = stakingPositionsData?.stake
    ? toDecimal(stakingPositionsData.stake, native.decimals)
    : undefined

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

  const availableBalance = toDecimal(
    Big.max(0, rawAvailableBalance),
    native.decimals,
  )

  const { isMobile, isTablet } = useBreakpoints()

  const isLoading = !!account && stakingPositionsPending

  if (isMobile || isTablet) {
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
                  staked={staked || "0"}
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
    <Flex direction="column" gap={28}>
      <Grid
        columnTemplate={[
          null,
          null,
          "minmax(390px, 1fr) minmax(0, 400px)",
          "minmax(470px, 1fr) minmax(0, 440px)",
        ]}
        columnGap={20}
        align="start"
      >
        <SectionHeader gridColumn="1/-1">{t("dashboard.title")}</SectionHeader>
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
                staked={staked || "0"}
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
    </Flex>
  )
}
