import { useBestNumber } from "api/chain"
import BN, { BigNumber } from "bignumber.js"
import * as wasm from "@galacticcouncil/math-staking"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import {
  TAccumulatedRpsUpdated,
  TStakingPosition,
  useHDXSupplyFromSubscan,
  useStake,
  useStakingConsts,
  useStakingEvents,
} from "api/staking"
import { useTokenBalance, useTokenLocks } from "api/balances"
import { getHydraAccountAddress } from "utils/api"
import {
  BN_0,
  BN_BILL,
  BN_QUINTILL,
  PARACHAIN_BLOCK_TIME,
} from "utils/constants"
import { useMemo } from "react"
import { useOpenGovReferendas } from "api/democracy"
import { scaleHuman } from "utils/balance"
import { useAssets } from "providers/assets"
import { useAccountAssets } from "api/deposits"
import { useAssetsPrice } from "state/displayPrice"
import { useIncreaseStake } from "./sections/dashboard/components/StakingInputSection/Stake/Stake.utils"
import { useShallow } from "hooks/useShallow"

const CONVICTIONS: { [key: string]: number } = {
  none: 0.1,
  locked1x: 1,
  locked2x: 2,
  locked3x: 3,
  locked4x: 4,
  locked5x: 5,
  locked6x: 6,
}

const lengthOfStaking = BN(50400) // min. amount of block for how long we want to calculate APR from = one week
const blocksPerYear = 2628000

/* constants that might be changed */
const a = "20000000000000000"
const b = "2000"

const MIN_SLASH_POINTS = "5"

export type TStakingData = NonNullable<ReturnType<typeof useStakeData>["data"]>

const getCurrentActionPoints = (
  votes: TStakingPosition["votes"],
  initialActionPoints: number,
  stakePosition: BN,
  activeReferendaIds: string[],
) => {
  let currentActionPoints = 0
  let maxActionPoints = 0

  const maxVotingPower = stakePosition.multipliedBy(CONVICTIONS["locked6x"])
  const maxActionPointsPerRef = 100
  const maxConviction = CONVICTIONS["locked6x"]

  const votedActiveReferendaIds: string[] = []

  votes?.forEach((vote) => {
    const convictionIndex = CONVICTIONS[vote.conviction.toLowerCase()]

    const isActiveReferenda = activeReferendaIds.includes(vote.id.toString())

    if (isActiveReferenda) {
      votedActiveReferendaIds.push(vote.id.toString())
    }

    currentActionPoints += Math.floor(
      vote.amount
        .multipliedBy(convictionIndex)
        .multipliedBy(maxActionPointsPerRef)
        .div(maxVotingPower)
        .toNumber(),
    )

    maxActionPoints += Math.floor(
      vote.amount
        .multipliedBy(isActiveReferenda ? maxConviction : convictionIndex)
        .multipliedBy(maxActionPointsPerRef)
        .div(maxVotingPower)
        .toNumber(),
    )
  })

  activeReferendaIds.forEach((activeReferendaId) => {
    if (!votedActiveReferendaIds.includes(activeReferendaId)) {
      maxActionPoints += Math.floor(
        stakePosition
          .multipliedBy(maxConviction)
          .multipliedBy(maxActionPointsPerRef)
          .div(maxVotingPower)
          .toNumber(),
      )
    }
  })

  const actionMultipliers = {
    democracyVote: 1,
  }

  currentActionPoints *= actionMultipliers.democracyVote
  currentActionPoints += initialActionPoints ?? 0

  maxActionPoints *= actionMultipliers.democracyVote
  maxActionPoints += initialActionPoints ?? 0

  return { currentActionPoints, maxActionPoints }
}

export const useStakeData = () => {
  const { native } = useAssets()

  const { account } = useAccount()
  const stake = useStake(account?.address)
  const { data: hdxSupply, isLoading: isSupplyLoading } =
    useHDXSupplyFromSubscan()
  const accountAssets = useAccountAssets()

  const locks = useTokenLocks(native.id)
  const { getAssetPrice, isLoading: isPriceLoading } = useAssetsPrice([
    native.id,
  ])

  const circulatingSupply = hdxSupply?.circulatingSupply

  const balance = accountAssets.data?.accountAssetsMap.get(native.id)?.balance
  const vestLocks = locks.data?.reduce(
    (acc, lock) => (lock.type === "ormlvest" ? acc.plus(lock.amount) : acc),
    BN_0,
  )

  const vested = vestLocks ?? BN_0
  const staked = stake.data?.stakePosition?.stake ?? BN_0
  const accumulatedLockedRewards =
    stake.data?.stakePosition?.accumulatedLockedRewards ?? BN_0

  const rawAvailableBalance = BN(balance?.freeBalance ?? "0")
    .minus(vested)
    .minus(staked)
    .minus(accumulatedLockedRewards)

  const availableBalance = BigNumber.max(0, rawAvailableBalance)

  const queries = [stake, locks]

  const isLoading =
    queries.some((query) => query.isInitialLoading) ||
    isSupplyLoading ||
    isPriceLoading

  const data = useMemo(() => {
    if (isLoading) return undefined
    const price = getAssetPrice(native.id).price

    const availableBalanceDollar = availableBalance
      ?.multipliedBy(price)
      .shiftedBy(-native.decimals)

    const totalStake = stake.data?.totalStake ?? 0

    const supplyStaked = BN(totalStake)
      .div(Number(circulatingSupply ?? 1))
      .decimalPlaces(4)
      .multipliedBy(100)

    const stakeDollar = stake.data?.stakePosition?.stake
      .multipliedBy(price)
      .shiftedBy(-native.decimals)

    const circulatingSupplyData = BN(circulatingSupply ?? 0).shiftedBy(
      -native.decimals,
    )

    const stakePosition = stake.data?.stakePosition

    return {
      supplyStaked,
      availableBalance,
      availableBalanceDollar,
      circulatingSupply: circulatingSupplyData,
      positionId: stake.data?.positionId,
      stakeDollar,
      stakePosition: stakePosition
        ? {
            ...stake.data?.stakePosition,
          }
        : undefined,
    }
  }, [
    availableBalance,
    circulatingSupply,
    isLoading,
    stake.data?.positionId,
    stake.data?.stakePosition,
    stake.data?.totalStake,
    native,
    getAssetPrice,
  ])

  return {
    data,
    isLoading,
  }
}

export const useStakeARP = () => {
  const { native } = useAssets()
  const { account } = useAccount()
  const bestNumber = useBestNumber()
  const stake = useStake(account?.address)
  const stakingEvents = useStakingEvents()
  const stakingConsts = useStakingConsts()
  const potAddress = getHydraAccountAddress(stakingConsts.data?.palletId)
  const potBalance = useTokenBalance(native.id, potAddress)
  const stakeValue = useIncreaseStake(useShallow((state) => state.stakeValue))

  const queries = [bestNumber, stake, stakingConsts, potBalance, stakingEvents]

  const isLoading = queries.some((query) => query.isLoading)

  const data = useMemo(() => {
    if (
      !stake.data ||
      !stakingConsts.data ||
      !bestNumber.data ||
      !potBalance.data ||
      !stakingEvents.data
    )
      return undefined

    const {
      potReservedBalance,
      accumulatedRewardPerStake,
      totalStake,
      positionId,
    } = stake.data

    const hasPosition = positionId

    const currentBlockNumber =
      bestNumber.data.parachainBlockNumber.toBigNumber()

    const pendingRewards = BN(potBalance.data.balance).minus(potReservedBalance)

    const { accumulatedRpsUpdated, stakingInitialized } = stakingEvents.data

    const {
      filteredAccumulatedRpsUpdatedBefore,
      filteredAccumulatedRpsUpdatedAfter,
    } = accumulatedRpsUpdated.events.reduce(
      (acc, event) => {
        const isBeforeStaking = currentBlockNumber
          .minus(lengthOfStaking)
          .gt(event.block.height)
        acc[
          isBeforeStaking
            ? "filteredAccumulatedRpsUpdatedBefore"
            : "filteredAccumulatedRpsUpdatedAfter"
        ].push(event)

        return acc
      },
      {
        filteredAccumulatedRpsUpdatedBefore: [] as TAccumulatedRpsUpdated[],
        filteredAccumulatedRpsUpdatedAfter: [] as TAccumulatedRpsUpdated[],
      },
    )

    if (hasPosition) {
      let rpsNow = BN_0
      let deltaRps = BN_0
      let deltaBlocks = BN_0

      if (pendingRewards.isZero()) {
        rpsNow = accumulatedRewardPerStake
      } else {
        rpsNow = BN(
          wasm.calculate_accumulated_rps(
            accumulatedRewardPerStake.toString(),
            pendingRewards.toString(),
            totalStake.toString(),
          ),
        )
      }

      if (filteredAccumulatedRpsUpdatedBefore?.length) {
        const lastAccumulatedRpsUpdated =
          filteredAccumulatedRpsUpdatedBefore[
            filteredAccumulatedRpsUpdatedBefore.length - 1
          ] // the newest event

        deltaRps = rpsNow.minus(lastAccumulatedRpsUpdated.args.accumulatedRps)
        deltaBlocks = currentBlockNumber.minus(
          lastAccumulatedRpsUpdated.block.height,
        )
      } else if (stakingInitialized) {
        const blockNumber = stakingInitialized.block.height
        deltaRps = rpsNow
        deltaBlocks = currentBlockNumber.minus(blockNumber)
      }

      const rpsAvg = deltaRps.dividedBy(deltaBlocks) // per block

      const apr = rpsAvg
        .div(BN_QUINTILL)
        .multipliedBy(blocksPerYear)
        .multipliedBy(100)

      return { apr }
    } else {
      const totalToStake = stake.data.totalStake.plus(stakeValue ?? 0)

      const rpsNow = pendingRewards.div(totalToStake)
      let deltaBlocks = BN_0
      let rpsAvg = BN_0

      const lastAccumulatedRpsUpdated =
        filteredAccumulatedRpsUpdatedBefore?.[
          filteredAccumulatedRpsUpdatedBefore.length - 1
        ] // the newest event

      if (
        filteredAccumulatedRpsUpdatedAfter &&
        filteredAccumulatedRpsUpdatedAfter.length
      ) {
        let deltaRpsAdjusted = BN_0

        filteredAccumulatedRpsUpdatedAfter.forEach((event, index, events) => {
          let re = BN_0
          if (index === 0) {
            if (lastAccumulatedRpsUpdated) {
              re = BN(event.args.accumulatedRps)
                .minus(lastAccumulatedRpsUpdated.args.accumulatedRps)
                .multipliedBy(event.args.totalStake)
            } else {
              re = BN(event.args.accumulatedRps).multipliedBy(
                event.args.totalStake,
              )
            }
          } else {
            re = BN(event.args.accumulatedRps)
              .minus(events[index - 1].args.accumulatedRps)
              .multipliedBy(event.args.totalStake)
          }
          deltaRpsAdjusted = deltaRpsAdjusted.plus(
            re.div(BN(event.args.totalStake).plus(stakeValue ?? 0)),
          )
        })

        deltaRpsAdjusted = deltaRpsAdjusted.plus(rpsNow)

        if (lastAccumulatedRpsUpdated) {
          deltaBlocks = currentBlockNumber.minus(
            lastAccumulatedRpsUpdated.block.height,
          )
        } else if (stakingInitialized) {
          deltaBlocks = currentBlockNumber.minus(
            stakingInitialized.block.height,
          )
        }

        const rpsAvg = deltaRpsAdjusted.div(deltaBlocks)

        const apr = rpsAvg
          .div(BN_QUINTILL)
          .multipliedBy(blocksPerYear)
          .multipliedBy(100)

        return { apr }
      } else if (stakingInitialized) {
        deltaBlocks = currentBlockNumber.minus(stakingInitialized.block.height)

        rpsAvg = rpsNow.div(deltaBlocks)

        const apr = rpsAvg
          .div(BN_QUINTILL)
          .multipliedBy(blocksPerYear)
          .multipliedBy(100)

        return { apr }
      }
      return { apr: BN_0 }
    }
  }, [
    stakeValue,
    bestNumber.data,
    potBalance.data,
    stake.data,
    stakingConsts.data,
    stakingEvents.data,
  ])

  return { data, isLoading }
}

export const useClaimReward = () => {
  const { native } = useAssets()
  const { account } = useAccount()
  const bestNumber = useBestNumber()
  const stake = useStake(account?.address)
  const stakingConsts = useStakingConsts()
  const { data: openGovReferendas = [] } = useOpenGovReferendas()
  const {
    value: increaseStake,
    diffDays: storedDiffDays,
    update,
  } = useIncreaseStake()

  const potAddress = getHydraAccountAddress(stakingConsts.data?.palletId)
  const potBalance = useTokenBalance(native.id, potAddress)

  const queries = [bestNumber, stake, stakingConsts, potBalance]
  const isLoading = queries.some((query) => query.isLoading)

  const data = useMemo(() => {
    if (
      !(
        potBalance.data &&
        stake.data?.stakePosition &&
        stakingConsts.data &&
        bestNumber.data
      )
    )
      return undefined

    const {
      potReservedBalance,
      accumulatedRewardPerStake,
      totalStake,
      stakePosition,
      positionId,
    } = stake.data

    const {
      periodLength,
      unclaimablePeriods,
      timePointsPerPeriod,
      timePointsWeight,
      actionPointsWeight,
      stakeWeight,
    } = stakingConsts.data

    const pendingRewards = BN(potBalance.data.balance).minus(potReservedBalance)

    let rewardPerStake = accumulatedRewardPerStake.toString()

    if (!pendingRewards.isZero() && !totalStake.isZero()) {
      rewardPerStake = wasm.calculate_accumulated_rps(
        accumulatedRewardPerStake.toString(),
        pendingRewards.toString(),
        totalStake.toString(),
      )
    }

    const currentPeriod = wasm.calculate_period_number(
      periodLength.toString(),
      bestNumber.data.parachainBlockNumber.toString(),
    )

    const enteredAt = wasm.calculate_period_number(
      periodLength.toString(),
      stakePosition.createdAt.toString(),
    )

    const maxRewards = wasm.calculate_rewards(
      rewardPerStake,
      stakePosition.rewardPerStake.toString(),
      stakePosition.stake.toString(),
    )

    const actionPoints = getCurrentActionPoints(
      stakePosition.votes,
      stakePosition.actionPoints.toNumber(),
      stakePosition.stake,
      openGovReferendas.map((referenda) => referenda.id),
    )

    const points = wasm.calculate_points(
      enteredAt,
      currentPeriod,
      timePointsPerPeriod.toString(),
      timePointsWeight.toString(),
      actionPoints.currentActionPoints.toString(),
      actionPointsWeight.toString(),
      stakePosition.accumulatedSlashPoints.toString(),
    )

    let increasePayablePercentageHuman: string | undefined
    if (increaseStake) {
      const slashedPoints = wasm.calculate_slashed_points(
        points,
        stakePosition.stake.toString(),
        increaseStake,
        stakeWeight,
        MIN_SLASH_POINTS,
      )

      const pointsAfterIncreasing = BigNumber.max(
        BigNumber(points).minus(slashedPoints),
        BN_0,
      ).toString()

      const increasePaylablePercentage = wasm.sigmoid(
        pointsAfterIncreasing,
        a,
        b,
      )

      increasePayablePercentageHuman = scaleHuman(
        increasePaylablePercentage,
        "q",
      )
        .multipliedBy(100)
        .toString()
    }

    let extraPayablePercentageHuman: string | undefined
    if (openGovReferendas.length) {
      const extraPoints = wasm.calculate_points(
        enteredAt,
        currentPeriod,
        timePointsPerPeriod.toString(),
        timePointsWeight.toString(),
        actionPoints.maxActionPoints.toString(),
        actionPointsWeight.toString(),
        stakePosition.accumulatedSlashPoints.toString(),
      )

      const extraPayablePercentage = wasm.sigmoid(extraPoints, a, b)

      extraPayablePercentageHuman = scaleHuman(extraPayablePercentage, "q")
        .multipliedBy(100)
        .toString()
    }

    const payablePercentage = wasm.sigmoid(points, a, b)

    const payablePercentageHuman = scaleHuman(
      payablePercentage,
      "q",
    ).multipliedBy(100)

    const totalRewards = BN(maxRewards)
      .plus(stakePosition.accumulatedUnpaidRewards)
      .plus(stakePosition.accumulatedLockedRewards)

    let currentPointDays: number | undefined
    let increasePointDays: number | undefined

    const chartValues = getChartValues(
      80,
      timePointsPerPeriod.toString(),
      timePointsWeight.toString(),
      periodLength.toString(),
    ).map((chartPoints, i, arr) => {
      const current =
        BN(payablePercentageHuman).gte(chartPoints.y) &&
        (arr[i + 1] ? BN(payablePercentageHuman).lt(arr[i + 1].y) : true)

      if (current) currentPointDays = chartPoints.x

      // calculate payable percentage if vote ongoing referendas
      const currentSecondary = extraPayablePercentageHuman
        ? BN(extraPayablePercentageHuman).gte(chartPoints.y) &&
          (arr[i + 1] ? BN(extraPayablePercentageHuman).lt(arr[i + 1].y) : true)
        : undefined

      const currentThird = increasePayablePercentageHuman
        ? BN(increasePayablePercentageHuman).gte(chartPoints.y) &&
          (arr[i + 1]
            ? BN(increasePayablePercentageHuman).lt(arr[i + 1].y)
            : true)
        : undefined

      if (currentThird) increasePointDays = chartPoints.x

      return { ...chartPoints, current, currentSecondary, currentThird }
    })

    if (BN(currentPeriod).minus(enteredAt).lte(unclaimablePeriods)) {
      return { rewards: BN_0, unlockedRewards: BN_0, positionId, chartValues }
    }

    if (currentPointDays) {
      if (!increasePointDays) {
        if (storedDiffDays) {
          update("diffDays", undefined)
        }
      } else {
        const diffDays = BigNumber(increasePointDays)
          .minus(currentPointDays)
          .abs()
          .toString()

        if (diffDays !== storedDiffDays) {
          update("diffDays", diffDays)
        }
      }
    }

    const userRewards = BN(
      wasm.calculate_percentage_amount(
        totalRewards.toString(),
        payablePercentage,
      ),
    )

    const availabeRewards = BN.max(
      stakePosition.accumulatedLockedRewards,
      userRewards,
    )

    return {
      positionId,
      rewards: availabeRewards.div(BN_BILL),
      maxRewards: totalRewards.div(BN_BILL),
      actionPoints,
      payablePercentage: payablePercentageHuman,
      chartValues,
      allocatedRewardsPercentage: availabeRewards
        .div(totalRewards)
        .multipliedBy(100),
    }
  }, [
    bestNumber.data,
    potBalance.data,
    stake,
    stakingConsts,
    openGovReferendas,
    increaseStake,
    storedDiffDays,
    update,
  ])

  return { data, isLoading }
}

const getChartValues = (
  periodAmount: number,
  timePointsPerPeriod: string,
  timePointsWeight: string,
  periodLength: string,
) => {
  return Array.from({ length: periodAmount }).reduce<
    { y: number; x: number }[]
  >((acc, _, i) => {
    const period = BN(i).times(10).toString()

    const points = wasm.calculate_points(
      "0",
      period,
      timePointsPerPeriod,
      timePointsWeight,
      "0",
      "0",
      "0",
    )

    const payablePercentage_ = wasm.sigmoid(points, a, b)

    const y = scaleHuman(payablePercentage_, "q")
      .multipliedBy(100)
      .decimalPlaces(2)
      .toNumber()

    const x = BN.max(
      BN(periodLength).times(period).times(PARACHAIN_BLOCK_TIME).div(86400),
      BN_0,
    ).toNumber()

    acc.push({
      x,
      y,
    })

    return acc
  }, [])
}
