import BN from "bignumber.js"
import { secondsInYear } from "date-fns/constants"
import { useActiveYieldFarms, useGlobalFarms, useYieldFarms } from "api/farms"
import { useMemo } from "react"
import { AccountId32 } from "@polkadot/types/interfaces/runtime"
import { BLOCK_TIME, BN_QUINTILL } from "utils/constants"

export const useAPR = (poolId: AccountId32) => {
  const activeYieldFarms = useActiveYieldFarms(poolId)
  const globalFarms = useGlobalFarms(
    activeYieldFarms.data?.map((f) => f.globalFarmId) ?? [],
  )
  const yieldFarms = useYieldFarms(activeYieldFarms.data ?? [])

  const queries = [activeYieldFarms, globalFarms, yieldFarms]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (!globalFarms.data || !activeYieldFarms.data || !yieldFarms.data)
      return []

    const farms = activeYieldFarms.data.map((af) => ({
      globalFarm: globalFarms.data.find((gf) => af.globalFarmId.eq(gf.id)),
      yieldFarm: yieldFarms.data.find((yf) => af.yieldFarmId.eq(yf.id)),
    }))

    const data = farms.map((farm) => {
      const { globalFarm, yieldFarm } = farm

      if (!globalFarm || !yieldFarm) return undefined

      const totalSharesZ = globalFarm.totalSharesZ.toBigNumber()
      const yieldPerPeriod = globalFarm.yieldPerPeriod
        .toBigNumber()
        .div(BN_QUINTILL) // 18dp
      const maxRewardPerPeriod = globalFarm.maxRewardPerPeriod.toBigNumber()
      const blocksPerPeriod = globalFarm.blocksPerPeriod.toBigNumber()
      const blockTime = BLOCK_TIME
      const multiplier = yieldFarm.multiplier.toBigNumber().div(BN_QUINTILL) // 18dp

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
      const apr = getAPR(poolYieldPerPeriod, blockTime, blocksPerPeriod)

      return { apr, assetId: globalFarm.rewardCurrency, ...farm }
    })

    return data
  }, [globalFarms.data, activeYieldFarms.data, yieldFarms.data])

  return { data, isLoading }
}

export const getGlobalRewardPerPeriod = (
  totalSharesZ: BN,
  yieldPerPeriod: BN,
  maxRewardPerPeriod: BN,
) => {
  const globalRewardPerPeriod = totalSharesZ.times(yieldPerPeriod)
  const isFarmFull = globalRewardPerPeriod.gte(maxRewardPerPeriod)

  return isFarmFull ? maxRewardPerPeriod : globalRewardPerPeriod
}

export const getPoolYieldPerPeriod = (
  globalRewardPerPeriod: BN,
  multiplier: BN,
  totalSharesZ: BN,
) => {
  return globalRewardPerPeriod.times(multiplier).div(totalSharesZ)
}

export const getAPR = (
  poolYieldPerPeriod: BN,
  blockTime: BN,
  blocksPerPeriod: BN,
) => {
  const secondsPerYear = new BN(secondsInYear)
  const periodsPerYear = secondsPerYear.div(blockTime.times(blocksPerPeriod))

  return poolYieldPerPeriod.times(periodsPerYear)
}
