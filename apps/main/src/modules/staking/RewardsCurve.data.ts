import { calculate_points, sigmoid } from "@galacticcouncil/math-staking"
import { bigMax } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { bestNumberQuery } from "@/api/chain"
import { stakingConstsQuery } from "@/api/constants"
import { accountOpenGovVotesQuery } from "@/api/democracy"
import { stakingRewardsQuery } from "@/api/staking"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"
import { stableQuery } from "@/utils/query"

const PERIOD_AMOUNT = 80

export type RewardsCurvePoint = {
  readonly x: number
  readonly y: number
  readonly current: boolean
  readonly currentSecondary: boolean | undefined
}

export const useRewardsCurveData = () => {
  const rpc = useRpcProvider()

  const { account } = useAccount()
  const address = account?.address ?? ""

  const { data: stakingConsts, isLoading: stakingConstsLoading } = useQuery(
    stakingConstsQuery(rpc),
  )

  const {
    data: votes,
    isLoading: votesLoading,
    isSuccess: votesSuccess,
  } = useQuery(accountOpenGovVotesQuery(rpc, address))

  const { data: blockNumber } = useQuery(stableQuery(bestNumberQuery(rpc)))

  const { data: stakingRewards, isLoading: stakingRewardsLoading } = useQuery({
    ...stakingRewardsQuery(
      rpc,
      address,
      votes?.map((vote) => vote.id.toString()) ?? [],
      blockNumber?.parachainBlockNumber ?? 0,
    ),
    enabled: votesSuccess,
  })

  const isLoading =
    stakingConstsLoading || votesLoading || stakingRewardsLoading

  const data = (() => {
    if (isLoading || !stakingConsts || !votes || !stakingRewards) {
      return []
    }

    const payablePercentageHuman = Big(
      scaleHuman(stakingRewards.payablePercentage, "q"),
    ).mul(100)

    const extraPayablePercentageHuman = stakingRewards.extraPayablePercentage
      ? Big(scaleHuman(stakingRewards.extraPayablePercentage, "q"))
          .mul(100)
          .toString()
      : undefined

    return Array.from({ length: PERIOD_AMOUNT })
      .map((_, i) => {
        const period = Big(i).times(10).toString()

        const points = calculate_points(
          "0",
          period,
          stakingConsts.timePointsPerPeriod.toString(),
          stakingConsts.timePointsWeight.toString(),
          "0",
          "0",
          "0",
        )

        const payablePercentage_ = sigmoid(
          points,
          stakingRewards.constants.a,
          stakingRewards.constants.b,
        )

        const y = Big(scaleHuman(payablePercentage_, "q")).mul(100).toNumber()

        const x = bigMax(
          Big(stakingConsts.periodLength)
            .times(period)
            .times(Big(rpc.slotDurationMs).div(1000))
            .div(86400),
          0,
        ).toNumber()

        return {
          x,
          y,
        }
      })
      .map<RewardsCurvePoint>((chartPoints, i, arr) => {
        const nextPoint = arr[i + 1]

        const current =
          Big(payablePercentageHuman).gte(chartPoints.y) &&
          (nextPoint ? Big(payablePercentageHuman).lt(nextPoint.y) : true)

        // calculate payable percentage if vote ongoing referendas
        const currentSecondary = extraPayablePercentageHuman
          ? Big(extraPayablePercentageHuman).gte(chartPoints.y) &&
            (nextPoint
              ? Big(extraPayablePercentageHuman).lt(nextPoint.y)
              : true)
          : undefined

        return {
          ...chartPoints,
          current,
          currentSecondary,
        }
      })
  })()

  return {
    data,
    isLoading,
  }
}
