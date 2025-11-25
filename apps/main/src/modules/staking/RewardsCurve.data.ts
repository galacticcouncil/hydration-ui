import {
  calculate_points,
  calculate_slashed_points,
  sigmoid,
} from "@galacticcouncil/math-staking"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { bestNumberQuery } from "@/api/chain"
import { stakingConstsQuery, uniquesIds } from "@/api/constants"
import { openGovRegerendasQuery } from "@/api/democracy"
import { stakingPositionsQuery, stakingRewardsQuery } from "@/api/staking"
import { useIncreaseStake } from "@/modules/staking/Stake.utils"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"
import { stableQuery } from "@/utils/query"

const PERIOD_AMOUNT = 80

export type RewardsCurvePoint = {
  readonly x: number
  readonly y: number
  readonly current: boolean
  readonly currentSecondary: boolean | undefined
  readonly currentThird: boolean | undefined
}

export const useRewardsCurveData = () => {
  const rpc = useRpcProvider()

  const { account } = useAccount()
  const address = account?.address ?? ""

  const { data: stakingConsts, isLoading: stakingConstsLoading } = useQuery(
    stakingConstsQuery(rpc),
  )

  const { data: uniquesData, isLoading: uniquesLoading } = useQuery(
    uniquesIds(rpc),
  )
  const stakingId = uniquesData?.stakingId ?? 0n

  const { data: stakingPosition, isLoading: isStakingPositionLoading } =
    useQuery(stakingPositionsQuery(rpc, address, stakingId))

  const { data: openGovReferendas, isLoading: openGovReferendasLoading } =
    useQuery(openGovRegerendasQuery(rpc))

  const { data: blockNumber } = useQuery(stableQuery(bestNumberQuery(rpc)))

  const { data: stakingRewards, isLoading: stakingRewardsLoading } = useQuery({
    ...stakingRewardsQuery(
      rpc,
      address,
      openGovReferendas?.map((referenda) => referenda.id) ?? [],
      blockNumber?.parachainBlockNumber ?? 0,
    ),
  })

  const {
    value: increaseStake,
    diffDays: storedDiffDays,
    update,
  } = useIncreaseStake()

  const isLoading =
    stakingConstsLoading ||
    stakingRewardsLoading ||
    isStakingPositionLoading ||
    uniquesLoading ||
    openGovReferendasLoading

  let currentPointDays: number | undefined
  let increasePointDays: number | undefined
  let increasePayablePercentageHuman: string | undefined

  const data = (() => {
    if (isLoading || !stakingConsts || !stakingRewards) {
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

    if (increaseStake && stakingPosition?.stake && stakingRewards.points) {
      const MIN_SLASH_POINTS = "5"

      const slashedPoints = calculate_slashed_points(
        stakingRewards.points,
        stakingPosition.stake.toString(),
        increaseStake,
        stakingConsts.stakeWeight,
        MIN_SLASH_POINTS,
      )

      const pointsAfterIncreasing = Big.max(
        Big(stakingRewards.points).minus(slashedPoints),
        0,
      ).toString()

      const increasePaylablePercentage = sigmoid(
        pointsAfterIncreasing,
        stakingRewards.constants.a,
        stakingRewards.constants.b,
      )

      increasePayablePercentageHuman = increasePaylablePercentage
        ? Big(scaleHuman(increasePaylablePercentage, "q")).mul(100).toString()
        : undefined
    }

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

        const x = Big.max(
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

        if (current) {
          currentPointDays = chartPoints.x
        }

        // calculate payable percentage if vote ongoing referendas
        const currentSecondary = extraPayablePercentageHuman
          ? Big(extraPayablePercentageHuman).gte(chartPoints.y) &&
            (nextPoint
              ? Big(extraPayablePercentageHuman).lt(nextPoint.y)
              : true)
          : undefined

        const currentThird = increasePayablePercentageHuman
          ? Big(increasePayablePercentageHuman).gte(chartPoints.y) &&
            (nextPoint
              ? Big(increasePayablePercentageHuman).lt(nextPoint.y)
              : true)
          : undefined

        if (currentThird) {
          increasePointDays = chartPoints.x
        }

        return {
          ...chartPoints,
          current,
          currentSecondary,
          currentThird,
        }
      })
  })()

  if (currentPointDays) {
    if (!increasePointDays) {
      if (storedDiffDays) {
        update("diffDays", undefined)
      }
    } else {
      const diffDays = Big(increasePointDays)
        .minus(currentPointDays)
        .abs()
        .toString()

      if (diffDays !== storedDiffDays) {
        update("diffDays", diffDays)
      }
    }
  }

  return {
    data,
    isLoading,
  }
}
