// @ts-nocheck
import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { useApiPromise } from "utils/api"
import { QUERY_KEYS } from "utils/queryKeys"
import BN from "bignumber.js"
import { getUniques } from "./uniques"
import { getReferendumInfoOf } from "./democracy"
import request, { gql } from "graphql-request"
import { PROVIDERS, useProviderRpcUrlStore } from "./provider"

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
    potReservedBalance: staking?.potReservedBalance?.toBigNumber() as BN,
    minStake: minStake.toBigNumber() as BN,
    positionId: stakePositionId,
    stakePosition: stakePositionId
      ? await getStakingPosition(api, stakePositionId)()
      : undefined,
  }
}

const getStakingPosition = (api: ApiPromise, id: number) => async () => {
  const [position, votesRes] = await Promise.all([
    api.query.staking.positions(id),
    api.query.staking.positionVotes(id),
  ])

  const votes: Array<{
    id: BN
    amount: BN
    conviction: string
  }> = await votesRes.votes.reduce(async (acc, [key, data]) => {
    const id = key.toBigNumber()
    const amount = data.amount.toBigNumber()
    const conviction = data.conviction.toString()

    const referendaInfo = await getReferendumInfoOf(api, id.toString())
    const isFinished = referendaInfo.value.isFinished

    if (!isFinished)
      acc.push({
        id,
        amount,
        conviction,
      })

    return acc
  }, [])

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

export const useStakingConsts = () => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.stakingConsts, getStakingConsts(api))
}

const getStakingConsts = (api: ApiPromise) => async () => {
  const [
    palletId,
    periodLength,
    unclaimablePeriods,
    timePointsPerPeriod,
    timePointsWeight,
    actionPointsWeight,
  ] = await Promise.all([
    api.consts.staking.palletId,
    api.consts.staking.periodLength,
    api.consts.staking.unclaimablePeriods,
    api.consts.staking.timePointsPerPeriod,
    api.consts.staking.timePointsWeight,
    api.consts.staking.actionPointsWeight,
  ])

  return {
    palletId: palletId.toHuman() as string,
    periodLength: periodLength.toBigNumber() as BN,
    unclaimablePeriods: unclaimablePeriods.toBigNumber() as BN,
    timePointsPerPeriod: timePointsPerPeriod.toBigNumber() as BN,
    timePointsWeight: timePointsWeight.toBigNumber() as BN,
    actionPointsWeight: actionPointsWeight.toBigNumber() as BN,
  }
}

type StakeEventType = {
  name: "Staking.StakingInitialized" | "Staking.AccumulatedRpsUpdated"
  id: string
  args: {
    accumulatedRps: string
    totalStake: string
  }
  block: {
    timestamp: string
  }
}

export const useStakingEvents = () => {
  const preference = useProviderRpcUrlStore()
  const rpcUrl = preference.rpcUrl ?? import.meta.env.VITE_PROVIDER_URL
  const selectedProvider = PROVIDERS.find((provider) => provider.url === rpcUrl)

  const indexerUrl =
    selectedProvider?.indexerUrl ?? import.meta.env.VITE_INDEXER_URL

  return useQuery(QUERY_KEYS.stakingEvents, getStakeEvents(indexerUrl))
}
const getStakeEvents = (indexerUrl: string) => async () => {
  return {
    ...(await request<{
      events: Array<StakeEventType>
    }>(
      indexerUrl,
      gql`
        query StakeEvents {
          events(
            where: {
              name_contains: "AccumulatedRpsUpdated"
              OR: { name_contains: "StakingInitialized" }
            }
          ) {
            args
            id
            block {
              timestamp
            }
            name
          }
        }
      `,
    )),
  }
}
