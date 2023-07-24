import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { NATIVE_ASSET_ID, useApiPromise } from "utils/api"
import { QUERY_KEYS } from "utils/queryKeys"
import BN from "bignumber.js"
import { useUniques } from "./uniques"
import { useAccountStore } from "state/store"
import { undefinedNoop } from "utils/helpers"
import { useTokenBalance, useTokenLocks } from "./balances"
import { BN_0 } from "utils/constants"
import { useAssetMeta } from "./assetMeta"
import { useDisplayPrice } from "../utils/displayAsset"

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

export const useStaking = () => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.staking, getStaking(api))
}

const getStaking = (api: ApiPromise) => async () => {
  const staking = await api.query.staking.staking()

  const minStake = await api.consts.staking.minStake

  const collectionId = await api.consts.staking.nftCollectionId

  return {
    totalStake: staking?.totalStake?.toBigNumber(),
    accumulatedRewardPerStake:
      staking?.accumulatedRewardPerStake?.toBigNumber(),
    accumulatedClaimableRewards:
      staking?.accumulatedClaimableRewards?.toBigNumber(),
    minStake: minStake.toBigNumber(),
    collectionId: collectionId.toBigNumber(),
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
  const res = await api.query.staking.positions(id)

  const data = res.unwrap()

  return {
    stake: data.stake.toBigNumber(),
    rewardPerStake: data.rewardPerStake.toBigNumber(),
    createdAt: data.createdAt.toBigNumber(),
    actionPoints: data.actionPoints.toBigNumber(),
    accumulatedUnpaidRewards: data.accumulatedUnpaidRewards.toBigNumber(),
    accumulatedSlashPoints: data.accumulatedSlashPoints.toBigNumber(),
    accumulatedLockedRewards: data.accumulatedLockedRewards.toBigNumber(),
  }
}

export const useStakingData = () => {
  const { account } = useAccountStore()
  const staking = useStaking()
  const circulatingSupply = useCirculatingSupply()
  const uniques = useUniques(
    account?.address,
    staking.data?.collectionId.toString(),
    true,
  )
  const balance = useTokenBalance(NATIVE_ASSET_ID, account?.address)

  const locks = useTokenLocks(NATIVE_ASSET_ID)
  const meta = useAssetMeta(NATIVE_ASSET_ID)
  const spotPrice = useDisplayPrice(NATIVE_ASSET_ID)

  const stakingNft = uniques.data?.find((nfts) => nfts)?.itemId.toNumber()

  const stakingPosition = useStakingPosition(stakingNft)

  const queries = [
    staking,
    circulatingSupply,
    uniques,
    stakingPosition,
    balance,
    locks,
    spotPrice,
  ]

  const isLoading = queries.some((query) => query.isInitialLoading)

  if (isLoading) return { data: undefined, isLoading }
  console.log({ staking })
  const decimals = meta.data?.decimals.neg().toNumber() ?? -12

  const vestLocks = locks.data?.reduce(
    (acc, lock) => (lock.type === "ormlvest" ? acc.plus(lock.amount) : acc),
    BN_0,
  )

  const availableBalance = balance.data?.balance.minus(vestLocks ?? 0)
  const availableBalanceDollar = availableBalance
    ?.multipliedBy(spotPrice.data?.spotPrice ?? 1)
    .shiftedBy(decimals)

  const totalStake = staking.data?.totalStake ?? 0

  const supplyStaked = BN(totalStake)
    .div(Number(circulatingSupply.data ?? 1))
    .decimalPlaces(2)
    .multipliedBy(100)

  const stakeDollar = stakingPosition.data?.stake
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
      stakingPosition: stakingPosition.data,
      stakingId: stakingNft,
      stakeDollar,
      minStake: staking.data?.minStake,
    },
    isLoading,
  }
}

export type TStakingData = ReturnType<typeof useStakingData>["data"]
