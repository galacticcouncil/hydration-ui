import { ApiPromise } from "@polkadot/api"
import { u32 } from "@polkadot/types"
import { BlockNumber } from "@polkadot/types/interfaces"
import {
  PalletLiquidityMiningGlobalFarmData,
  PalletLiquidityMiningYieldFarmData,
} from "@polkadot/types/lookup"
import { useQuery } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import { secondsInYear } from "date-fns"
import { useApiPromise } from "utils/api"
import { BLOCK_TIME, BN_0, BN_QUINTILL } from "utils/constants"
import { Maybe, undefinedNoop, useQueryReduce } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { useBestNumber } from "./chain"

export function useActiveYieldFarms(poolId: Maybe<u32 | string>) {
  const api = useApiPromise()
  return useQuery(
    QUERY_KEYS.activeYieldFarms(poolId),
    poolId != null ? getActiveYieldFarms(api, poolId) : undefinedNoop,
    { enabled: poolId != null },
  )
}

const getActiveYieldFarms =
  (api: ApiPromise, poolId: u32 | string) => async () => {
    const res = await api.query.omnipoolWarehouseLM.activeYieldFarm.entries(
      poolId,
    )
    return res.map(([storageKey, codec]) => {
      const [poolId, globalFarmId] = storageKey.args
      const yieldFarmId = codec.unwrap()
      return { poolId, globalFarmId, yieldFarmId }
    })
  }

export function useYieldFarms(
  ids: Maybe<
    {
      poolId: u32 | string
      globalFarmId: u32 | string
      yieldFarmId: u32 | string
    }[]
  >,
) {
  const api = useApiPromise()
  return useQuery(
    QUERY_KEYS.yieldFarms(ids),
    ids != null ? getYieldFarms(api, ids) : undefinedNoop,
    { enabled: ids != null },
  )
}

const getYieldFarms =
  (
    api: ApiPromise,
    ids: {
      poolId: u32 | string
      globalFarmId: u32 | string
      yieldFarmId: u32 | string
    }[],
  ) =>
  async () => {
    const res = await Promise.all(
      ids.map(({ poolId, globalFarmId, yieldFarmId }) =>
        api.query.omnipoolWarehouseLM.yieldFarm(
          poolId,
          globalFarmId,
          yieldFarmId,
        ),
      ),
    )

    return res.map((data) => data.unwrap())
  }

export function useYieldFarm(data: {
  poolId: Maybe<u32 | string>
  globalFarmId: Maybe<u32 | string>
  yieldFarmId: Maybe<u32 | string>
}) {
  const api = useApiPromise()
  return useQuery(
    QUERY_KEYS.yieldFarm(data),
    data.poolId != null && data.globalFarmId != null && data.yieldFarmId != null
      ? getYieldFarm(api, data.poolId, data.globalFarmId, data.yieldFarmId)
      : undefinedNoop,
    {
      enabled:
        data.poolId != null &&
        data.globalFarmId != null &&
        data.yieldFarmId != null,
    },
  )
}

const getYieldFarm =
  (
    api: ApiPromise,
    poolId: u32 | string,
    globalFarmId: u32 | string,
    yieldFarmId: u32 | string,
  ) =>
  async () => {
    const yieldFarm = await api.query.omnipoolWarehouseLM.yieldFarm(
      poolId,
      globalFarmId,
      yieldFarmId,
    )
    return yieldFarm.unwrap()
  }

export function useGlobalFarm(id: Maybe<u32 | string>) {
  const api = useApiPromise()
  return useQuery(
    QUERY_KEYS.globalFarm(id),
    id != null ? getGlobalFarm(api, id) : undefinedNoop,
    { enabled: id != null },
  )
}

const getGlobalFarm = (api: ApiPromise, id: u32 | string) => async () => {
  const globalFarm = await api.query.omnipoolWarehouseLM.globalFarm(id)
  return globalFarm.unwrap()
}

export function useGlobalFarms(ids: Maybe<{ globalFarmId: u32 }[]>) {
  const api = useApiPromise()
  return useQuery(
    QUERY_KEYS.globalFarms(ids),
    ids != null ? getGlobalFarms(api, ids) : undefinedNoop,
    { enabled: ids != null },
  )
}

const getGlobalFarms =
  (api: ApiPromise, ids: { globalFarmId: u32 }[]) => async () => {
    const globalFarms = await api.query.omnipoolWarehouseLM.globalFarm.multi(
      ids.map((i) => i.globalFarmId),
    )
    return globalFarms.map((i) => i.unwrap())
  }

export interface Farm {
  globalFarm: PalletLiquidityMiningGlobalFarmData
  yieldFarm: PalletLiquidityMiningYieldFarmData
}

export type FarmAprs = ReturnType<typeof useFarmAprs>

export const useFarms = (poolId: u32 | string) => {
  const activeYieldFarms = useActiveYieldFarms(poolId)
  const globalFarms = useGlobalFarms(activeYieldFarms.data)
  const yieldFarms = useYieldFarms(activeYieldFarms.data)

  return useQueryReduce(
    [activeYieldFarms, globalFarms, yieldFarms] as const,
    (activeYieldFarms, globalFarms, yieldFarms) => {
      const farms =
        activeYieldFarms?.map((af) => {
          const globalFarm = globalFarms?.find((gf) =>
            af.globalFarmId.eq(gf.id),
          )
          const yieldFarm = yieldFarms?.find((yf) => af.yieldFarmId.eq(yf.id))
          if (!globalFarm || !yieldFarm) return undefined
          return { globalFarm, yieldFarm }
        }) ?? []

      return farms.filter((x): x is Farm => x != null)
    },
  )
}

function getGlobalRewardPerPeriod(
  totalSharesZ: BigNumber,
  yieldPerPeriod: BigNumber,
  maxRewardPerPeriod: BigNumber,
) {
  const globalRewardPerPeriod = totalSharesZ.times(yieldPerPeriod)
  const isFarmFull = globalRewardPerPeriod.gte(maxRewardPerPeriod)

  return isFarmFull ? maxRewardPerPeriod : globalRewardPerPeriod
}

function getPoolYieldPerPeriod(
  globalRewardPerPeriod: BigNumber,
  multiplier: BigNumber,
  totalSharesZ: BigNumber,
) {
  return globalRewardPerPeriod.times(multiplier).div(totalSharesZ)
}

function getFarmApr(
  bestNumber: {
    parachainBlockNumber: BlockNumber
    relaychainBlockNumber: u32
  },
  farm: Farm,
) {
  const { globalFarm, yieldFarm } = farm

  const loyaltyFactor = yieldFarm.loyaltyCurve.isNone
    ? null
    : yieldFarm.loyaltyCurve
        .unwrap()
        .initialRewardPercentage.toBigNumber()
        .div(BN_QUINTILL)

  const loyaltyCurve = yieldFarm.loyaltyCurve.unwrapOr(null)
  const totalSharesZ = globalFarm.totalSharesZ.toBigNumber()
  const plannedYieldingPeriods = globalFarm.plannedYieldingPeriods.toBigNumber()
  const yieldPerPeriod = globalFarm.yieldPerPeriod
    .toBigNumber()
    .div(BN_QUINTILL) // 18dp
  const maxRewardPerPeriod = globalFarm.maxRewardPerPeriod.toBigNumber()
  const blocksPerPeriod = globalFarm.blocksPerPeriod.toBigNumber()
  const currentPeriod = bestNumber.relaychainBlockNumber
    .toBigNumber()
    .dividedToIntegerBy(blocksPerPeriod)
  const blockTime = BLOCK_TIME
  const multiplier = yieldFarm.multiplier.toBigNumber().div(BN_QUINTILL)
  const secondsPerYear = new BigNumber(secondsInYear)
  const periodsPerYear = secondsPerYear.div(blockTime.times(blocksPerPeriod))

  let apr
  if (totalSharesZ.isZero()) {
    apr = yieldPerPeriod.times(multiplier).times(periodsPerYear)
  } else {
    const globalRewardPerPeriod = getGlobalRewardPerPeriod(
      totalSharesZ,
      yieldPerPeriod,
      maxRewardPerPeriod,
    )
    const poolYieldPerPeriod = getPoolYieldPerPeriod(
      globalRewardPerPeriod,
      multiplier,
      totalSharesZ,
    )
    apr = poolYieldPerPeriod.times(periodsPerYear)
  }

  // multiply by 100 since APR should be a percentage
  apr = apr.times(100)

  const minApr = loyaltyFactor ? apr.times(loyaltyFactor) : null
  // max distribution of rewards
  // https://www.notion.so/Screen-elements-mapping-Farms-baee6acc456542ca8d2cccd1cc1548ae?p=4a2f16a9f2454095945dbd9ce0eb1b6b&pm=s
  const distributedRewards = globalFarm.pendingRewards
    .toBigNumber()
    .plus(globalFarm.accumulatedPaidRewards.toBigNumber())

  const maxRewards = maxRewardPerPeriod.times(plannedYieldingPeriods)
  const leftToDistribute = maxRewards.minus(distributedRewards)

  // estimate, when the farm will most likely distribute all the rewards
  const updatedAtPeriod = globalFarm.updatedAt.toBigNumber()
  const periodsLeft = leftToDistribute.div(maxRewardPerPeriod)

  // if there are no deposits, the farm is not running and distributing rewards
  const estimatedEndPeriod = totalSharesZ.gte(0)
    ? updatedAtPeriod.plus(periodsLeft)
    : currentPeriod.plus(periodsLeft)

  const estimatedEndBlock = estimatedEndPeriod.times(blocksPerPeriod)

  // fullness of the farm
  // interpreted as how close are we to the cap of yield per period
  // https://www.notion.so/FAQ-59697ce6fd2e46e1b8f9093ba4606e88#446ee616be484c5e86e5eb82d3a29455
  const fullness = totalSharesZ.times(yieldPerPeriod).div(maxRewardPerPeriod)

  return {
    apr,
    minApr,
    distributedRewards,
    maxRewards,
    fullness,
    estimatedEndBlock: estimatedEndBlock,
    assetId: globalFarm.rewardCurrency,
    currentPeriod,
    loyaltyCurve,
  }
}

export const useFarmApr = (farm: {
  globalFarm: PalletLiquidityMiningGlobalFarmData
  yieldFarm: PalletLiquidityMiningYieldFarmData
}) => {
  const bestNumber = useBestNumber()

  return useQueryReduce([bestNumber] as const, (bestNumber) => {
    return getFarmApr(bestNumber, farm)
  })
}

export const useFarmAprs = (
  farms: {
    globalFarm: PalletLiquidityMiningGlobalFarmData
    yieldFarm: PalletLiquidityMiningYieldFarmData
  }[],
) => {
  const bestNumber = useBestNumber()

  return useQueryReduce([bestNumber] as const, (bestNumber) => {
    return farms.map((farm) => getFarmApr(bestNumber, farm))
  })
}

export const getMinAndMaxAPR = (farms: FarmAprs) => {
  const aprs = farms.data ? farms.data.map(({ apr }) => apr) : [BN_0]
  const minAprs = farms.data
    ? farms.data.map(({ minApr, apr }) => (minApr ? minApr : apr))
    : [BN_0]

  const minApr = BigNumber.minimum(...minAprs)
  const maxApr = BigNumber.maximum(...aprs)

  return {
    minApr,
    maxApr,
  }
}
