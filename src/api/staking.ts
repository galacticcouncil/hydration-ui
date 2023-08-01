import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import {
  NATIVE_ASSET_ID,
  getHydraAccountAddress,
  useApiPromise,
} from "utils/api"
import { QUERY_KEYS } from "utils/queryKeys"
import BN from "bignumber.js"
import { getUniques, useUniques } from "./uniques"
import { useAccountStore } from "state/store"
import { undefinedNoop, useQueryReduce } from "utils/helpers"
import { useTokenBalance, useTokenLocks } from "./balances"
import { BN_0, BN_BILL } from "utils/constants"
import { useAssetMeta } from "./assetMeta"
import { useDisplayPrice } from "../utils/displayAsset"
import * as stakingWasm from "@galacticcouncil/math/build/staking/bundler"
import { useBestNumber } from "./chain"

const CONVICTIONS = {
  none: 1,
  locked1x: 2,
  locked2x: 3,
  locked3x: 4,
  locked4x: 5,
  locked5x: 6,
  locked6x: 7,
}

interface ISubscanData {
  code: number
  message: string
  generated_at: number
  data: {
    token: Array<string>
    detail: {
      [key: string]: {
        symbol: string
        unique_id: string
        display_name: string
        asset_type: string
        token_decimals: number
        price: string
        price_change: string
        total_issuance: string
        free_balance: string
        available_balance: string
        locked_balance: string
        reserved_balance: string
        validator_bonded: string
        nominator_bonded: string
        bonded_locked_balance: string
        unbonded_locked_balance: string
        democracy_locked_balance: string
        election_locked_balance: string
        vesting_balance: string
        inflation: string
      }
    }
  }
}

export const useCirculatingSupply = () => {
  return useQuery(
    QUERY_KEYS.circulatingSupply,
    async () => {
      const res = await getCirculatingSupply()()

      return res.data.detail["HDX"].available_balance
    },
    { retry: 0 },
  )
}

const getCirculatingSupply = () => async () => {
  const res = await fetch("https://hydradx.api.subscan.io/api/scan/token")

  const data: Promise<ISubscanData> = res.json()

  return data
}

export const useStake = (address: string | undefined) => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.stake(address), getStake(api, address))
}

const getStake = (api: ApiPromise, address: string | undefined) => async () => {
  const staking = await api.query.staking.staking()

  const minStake = await api.consts.staking.minStake

  const collectionId = await api.consts.staking.nftCollectionId

  const uniques = await getUniques(api, address, collectionId.toString())()

  const stakePositionId = uniques.find((nfts) => nfts)?.itemId.toNumber()

  return {
    totalStake: staking?.totalStake?.toBigNumber() as BN,
    accumulatedRewardPerStake:
      staking?.accumulatedRewardPerStake?.toBigNumber() as BN,
    accumulatedClaimableRewards:
      staking?.accumulatedClaimableRewards?.toBigNumber() as BN,
    minStake: minStake.toBigNumber() as BN,
    positionId: stakePositionId,
    stakePosition: stakePositionId
      ? await getStakingPosition(api, stakePositionId)()
      : undefined,
  }
}

export const useStakingPosition = (id: number | undefined) => {
  const api = useApiPromise()

  return useQuery(
    QUERY_KEYS.stakingPosition(id),
    id != null ? getStakingPosition(api, id) : undefinedNoop,
    { enabled: id != null, retry: 0 },
  )
}

const getStakingPosition = (api: ApiPromise, id: number) => async () => {
  const position = await api.query.staking.positions(id)

  const votesRes = await api.query.staking.positionVotes(id)

  const votes = votesRes.votes.map(([key, data]) => {
    return {
      id: key.toBigNumber(),
      amount: data.amount.toBigNumber(),
      conviction: data.conviction.toString(),
    }
  })

  const positionData = position.unwrap()

  return {
    stake: positionData.stake.toBigNumber() as BN,
    rewardPerStake: positionData.rewardPerStake.toBigNumber() as BN,
    createdAt: positionData.createdAt.toBigNumber() as BN,
    actionPoints: positionData.actionPoints.toBigNumber() as BN,
    accumulatedUnpaidRewards:
      positionData.accumulatedUnpaidRewards.toBigNumber() as BN,
    accumulatedSlashPoints:
      positionData.accumulatedSlashPoints.toBigNumber() as BN,
    accumulatedLockedRewards:
      positionData.accumulatedLockedRewards.toBigNumber() as BN,
    votes: votes,
  }
}

const useStakingConsts = () => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.stakingConsts, getStakingConsts(api))
}

const getStakingConsts = (api: ApiPromise) => async () => {
  const palletId = await api.consts.staking.palletId

  //const periodLength = await api.consts.staking.periodLength

  const unclaimablePeriods = await api.consts.staking.unclaimablePeriods

  const timePointsPerPeriod = await api.consts.staking.timePointsPerPeriod

  const timePointsWeight = await api.consts.staking.timePointsWeight

  const actionPointsWeight = await api.consts.staking.actionPointsWeight

  return {
    palletId: palletId.toHuman() as string,
    periodLength: BN(1), //periodLength.toBigNumber() as BN,
    unclaimablePeriods: unclaimablePeriods.toBigNumber() as BN,
    timePointsPerPeriod: timePointsPerPeriod.toBigNumber() as BN,
    timePointsWeight: timePointsWeight.toBigNumber() as BN,
    actionPointsWeight: actionPointsWeight.toBigNumber() as BN,
  }
}

export const useClaimReward = () => {
  const { account } = useAccountStore()
  const bestNumber = useBestNumber()
  const stake = useStake(account?.address)
  const stakingConsts = useStakingConsts()
  const potAddress = getHydraAccountAddress(stakingConsts.data?.palletId)
  const potBalance = useTokenBalance(NATIVE_ASSET_ID, potAddress)

  return useQueryReduce(
    [stake, potBalance, bestNumber, stakingConsts] as const,
    (stake, potBalance, bestNumber, stakingConsts) => {
      const {
        accumulatedClaimableRewards,
        accumulatedRewardPerStake,
        totalStake,
        stakePosition,
      } = stake

      const {
        periodLength,
        unclaimablePeriods,
        timePointsPerPeriod,
        timePointsWeight,
        actionPointsWeight,
      } = stakingConsts

      if (!(potBalance?.balance && stake && stakePosition && stakingConsts))
        return undefined

      const pendingRewards = potBalance.balance.minus(
        accumulatedClaimableRewards,
      )

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
        bestNumber.parachainBlockNumber.toString(),
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

      let actionMultipliers = {
        democracyVote: 1,
      }

      actionPoints *= actionMultipliers.democracyVote
      actionPoints += stakePosition.actionPoints.toNumber()

      let points = stakingWasm.calculate_points(
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
        currentPeriod,
        rewardPerStake,
        maxRewards,
        actionPoints,
        points,
        payablePercentage,
        rewards,
        unlockedRewards,
      }
    },
  )
}

export const useStakeData = () => {
  const { account } = useAccountStore()
  const stake = useStake(account?.address)
  const circulatingSupply = useCirculatingSupply()

  const balance = useTokenBalance(NATIVE_ASSET_ID, account?.address)

  const locks = useTokenLocks(NATIVE_ASSET_ID)
  const meta = useAssetMeta(NATIVE_ASSET_ID)
  const spotPrice = useDisplayPrice(NATIVE_ASSET_ID)

  const queries = [stake, circulatingSupply, balance, locks, spotPrice]

  const isLoading = queries.some((query) => query.isInitialLoading)

  if (isLoading) return { data: undefined, isLoading }

  const decimals = meta.data?.decimals.neg().toNumber() ?? -12

  const vestLocks = locks.data?.reduce(
    (acc, lock) => (lock.type === "ormlvest" ? acc.plus(lock.amount) : acc),
    BN_0,
  )

  const availableBalance = balance.data?.balance.minus(vestLocks ?? 0)

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

export type TStakingData = ReturnType<typeof useStakeData>["data"]
