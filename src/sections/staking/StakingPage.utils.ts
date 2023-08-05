import { useBestNumber } from "api/chain"
import BN from "bignumber.js"
import * as stakingWasm from "@galacticcouncil/math/build/staking/bundler"
import { useAccountStore } from "state/store"
import {
  useCirculatingSupply,
  useStake,
  useStakingConsts,
  useStakingEvents,
} from "api/staking"
import { useTokenBalance, useTokenLocks } from "api/balances"
import { NATIVE_ASSET_ID, getHydraAccountAddress } from "utils/api"
import { useAssetMeta } from "api/assetMeta"
import { useDisplayPrice } from "utils/displayAsset"
import { BN_0, BN_BILL } from "utils/constants"
import { useMemo } from "react"

const CONVICTIONS: { [key: string]: number } = {
  none: 1,
  locked1x: 2,
  locked2x: 3,
  locked3x: 4,
  locked4x: 5,
  locked5x: 6,
  locked6x: 7,
}

const x = BN(50400) // min. amount of block for how long we want to calculate APR from - one week 50400
const blockPerYear = 2628000

const getBlockNumberFromEventId = (id: string) => BN(id.split("-")[0])

export type TStakingData = ReturnType<typeof useStakeData>["data"]

export const useStakeData = () => {
  const { account } = useAccountStore()
  const stake = useStake(account?.address)
  const circulatingSupply = useCirculatingSupply()
  const balance = useTokenBalance(NATIVE_ASSET_ID, account?.address)

  const locks = useTokenLocks(NATIVE_ASSET_ID)
  const meta = useAssetMeta(NATIVE_ASSET_ID)
  const spotPrice = useDisplayPrice(NATIVE_ASSET_ID)

  const vestLocks = locks.data?.reduce(
    (acc, lock) => (lock.type === "ormlvest" ? acc.plus(lock.amount) : acc),
    BN_0,
  )

  const availableBalance = balance.data?.balance.minus(vestLocks ?? 0)

  const queries = [stake, circulatingSupply, balance, locks, spotPrice]

  const isLoading = queries.some((query) => query.isInitialLoading)

  if (isLoading) return { data: undefined, isLoading }

  const decimals = meta.data?.decimals.neg().toNumber() ?? -12

  const availableBalanceDollar = availableBalance
    ?.multipliedBy(spotPrice.data?.spotPrice ?? 1)
    .shiftedBy(decimals)

  const totalStake = stake.data?.totalStake ?? 0

  const supplyStaked = BN(totalStake)
    .div(Number(circulatingSupply.data ?? 1))
    .decimalPlaces(4)
    .multipliedBy(100)

  const stakeDollar = stake.data?.stakePosition?.stake
    .multipliedBy(spotPrice.data?.spotPrice ?? 1)
    .shiftedBy(decimals)

  const circulatingSupplyData = BN(circulatingSupply.data ?? 0).shiftedBy(
    decimals,
  )

  return {
    data: {
      supplyStaked,
      availableBalance,
      availableBalanceDollar,
      circulatingSupply: circulatingSupplyData,
      stakePosition: stake.data?.stakePosition,
      positionId: stake.data?.positionId,
      stakeDollar,
      minStake: stake.data?.minStake,
    },
    isLoading,
  }
}

export const useStakeARP = (availableUserBalance: BN | undefined) => {
  const { account } = useAccountStore()
  const bestNumber = useBestNumber()
  const stake = useStake(account?.address)
  const stakingEvents = useStakingEvents()
  const stakingConsts = useStakingConsts()
  const potAddress = getHydraAccountAddress(stakingConsts.data?.palletId)
  const potBalance = useTokenBalance(NATIVE_ASSET_ID, potAddress)

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

    const pendingRewards = potBalance.data.balance.minus(potReservedBalance)

    const accumulatedRpsUpdated = stakingEvents.data?.events.filter(
      (event) => event.name === "Staking.AccumulatedRpsUpdated",
    )

    const stakingInitialized = stakingEvents.data?.events.find(
      (event) => event.name === "Staking.StakingInitialized",
    )

    if (hasPosition) {
      let rpsNow = BN_0
      let deltaRps = BN_0
      let deltaBlocks = BN_0

      if (pendingRewards.isZero()) {
        rpsNow = accumulatedRewardPerStake
      } else {
        rpsNow = BN(
          stakingWasm.calculate_accumulated_rps(
            accumulatedRewardPerStake.toString(),
            pendingRewards.toString(),
            totalStake.toString(),
          ),
        )
      }

      const filteredAccumulatedRpsUpdatedBefore = accumulatedRpsUpdated?.filter(
        (event) =>
          currentBlockNumber.minus(x).gt(getBlockNumberFromEventId(event.id)),
      )

      if (filteredAccumulatedRpsUpdatedBefore?.length) {
        const lastAccumulatedRpsUpdated =
          filteredAccumulatedRpsUpdatedBefore[
            filteredAccumulatedRpsUpdatedBefore.length - 1
          ] // the newest event

        deltaRps = rpsNow.minus(lastAccumulatedRpsUpdated.args.accumulatedRps)
        deltaBlocks = currentBlockNumber.minus(
          getBlockNumberFromEventId(lastAccumulatedRpsUpdated.id),
        )
      } else if (stakingInitialized) {
        const blockNumber = getBlockNumberFromEventId(stakingInitialized.id)
        deltaRps = rpsNow
        deltaBlocks = currentBlockNumber.minus(blockNumber)
      }

      const rpsAvg = deltaRps.dividedBy(deltaBlocks) // per block

      const apr = rpsAvg
        .div(BN_BILL)
        .multipliedBy(blockPerYear)
        .multipliedBy(100)

      return { apr }
    } else {
      const totalToStake = stake.data.totalStake.plus(availableUserBalance ?? 0)
      const rpsNow = pendingRewards.div(totalToStake)
      let deltaBlocks = BN_0
      let rpsAvg = BN_0

      const filteredAccumulatedRpsUpdatedAfter = accumulatedRpsUpdated?.filter(
        (event) =>
          currentBlockNumber.minus(x).lte(getBlockNumberFromEventId(event.id)), //e.triggered_at >= (now - X)
      )

      const filteredAccumulatedRpsUpdatedBefore = accumulatedRpsUpdated?.filter(
        (event) =>
          currentBlockNumber.minus(x).gt(getBlockNumberFromEventId(event.id)), //e.triggered_at >= (now - X)
      )

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
            re.div(BN(event.args.totalStake).plus(availableUserBalance ?? 0)),
          )
        })

        deltaRpsAdjusted = deltaRpsAdjusted.plus(rpsNow)

        if (lastAccumulatedRpsUpdated) {
          deltaBlocks = currentBlockNumber.minus(
            getBlockNumberFromEventId(lastAccumulatedRpsUpdated.id),
          )
        } else if (stakingInitialized) {
          deltaBlocks = currentBlockNumber.minus(
            getBlockNumberFromEventId(stakingInitialized.id),
          )
        }

        const rpsAvg = deltaRpsAdjusted.div(deltaBlocks)

        const apr = rpsAvg
          .div(BN_BILL)
          .multipliedBy(blockPerYear)
          .multipliedBy(100)

        return { apr }
      } else if (stakingInitialized) {
        deltaBlocks = currentBlockNumber.minus(
          getBlockNumberFromEventId(stakingInitialized.id),
        )

        rpsAvg = rpsNow.div(deltaBlocks)

        const apr = rpsAvg
          .div(BN_BILL)
          .multipliedBy(blockPerYear)
          .multipliedBy(100)

        return { apr }
      }
      return { apr: BN_0 }
    }
  }, [
    availableUserBalance,
    bestNumber.data,
    potBalance.data,
    stake.data,
    stakingConsts.data,
    stakingEvents.data,
  ])

  return { data, isLoading }
}

export const useClaimReward = () => {
  const { account } = useAccountStore()
  const bestNumber = useBestNumber()
  const stake = useStake(account?.address)
  const stakingConsts = useStakingConsts()
  const potAddress = getHydraAccountAddress(stakingConsts.data?.palletId)
  const potBalance = useTokenBalance(NATIVE_ASSET_ID, potAddress)

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
    } = stake.data

    const {
      periodLength,
      unclaimablePeriods,
      timePointsPerPeriod,
      timePointsWeight,
      actionPointsWeight,
    } = stakingConsts.data

    const pendingRewards = potBalance.data.balance.minus(potReservedBalance)

    let rewardPerStake = accumulatedRewardPerStake.toString()

    if (!pendingRewards.isZero() && !totalStake.isZero()) {
      rewardPerStake = stakingWasm.calculate_accumulated_rps(
        accumulatedRewardPerStake.toString(),
        pendingRewards.toString(),
        totalStake.toString(),
      )
    }

    const currentPeriod = stakingWasm.calculate_period_number(
      periodLength.toString(),
      bestNumber.data.parachainBlockNumber.toString(),
    )

    const enteredAt = stakingWasm.calculate_period_number(
      periodLength.toString(),
      stakePosition.createdAt.toString(),
    )

    if (BN(currentPeriod).minus(enteredAt).lte(unclaimablePeriods)) {
      return { rewards: BN_0, unlockedRewards: BN_0 }
    }

    const maxRewards = stakingWasm.calculate_rewards(
      rewardPerStake,
      stakePosition.rewardPerStake.toString(),
      stakePosition.stake.toString(),
    )

    let actionPoints = 0

    stakePosition.votes.forEach((vote) => {
      const convictionIndex = CONVICTIONS[vote.conviction.toLowerCase()]

      actionPoints += vote.amount
        .multipliedBy(convictionIndex)
        .div(BN_BILL)
        .toNumber()
    })

    const actionMultipliers = {
      democracyVote: 1,
    }

    actionPoints *= actionMultipliers.democracyVote
    actionPoints += stakePosition.actionPoints.toNumber()

    const points = stakingWasm.calculate_points(
      stakePosition.createdAt.toString(),
      currentPeriod,
      timePointsPerPeriod.toString(),
      timePointsWeight.toString(),
      actionPoints.toString(),
      actionPointsWeight.toString(),
      stakePosition.accumulatedSlashPoints.toString(),
    )

    const payablePercentage = stakingWasm.sigmoid(
      points,
      "150000000000000000",
      "40000",
    )

    let rewards = BN(
      stakingWasm.calculate_percentage_amount(maxRewards, payablePercentage),
    )

    rewards.plus(
      stakingWasm.calculate_percentage_amount(
        stakePosition.accumulatedUnpaidRewards.toString(),
        payablePercentage,
      ),
    )

    const unlockedRewards = BN(
      stakingWasm.calculate_percentage_amount(
        stakePosition.accumulatedLockedRewards.toString(),
        payablePercentage,
      ),
    )

    return {
      rewards: rewards.div(BN_BILL),
      unlockedRewards: unlockedRewards.div(BN_BILL),
      actionPoints,
    }
  }, [bestNumber.data, potBalance.data, stake, stakingConsts])

  return { data, isLoading }
}
