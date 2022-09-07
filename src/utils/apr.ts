import BN from "bignumber.js"
import { secondsInYear } from "date-fns/constants"
import { useActiveYieldFarms, useGlobalFarms, useYieldFarms } from "api/farms"
import { useMemo } from "react"
import { AccountId32 } from "@polkadot/types/interfaces/runtime"
import { BN_QUINTILL } from "utils/constants"

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

    const aFarms = activeYieldFarms.data
    const gFarms = globalFarms.data.filter((gf) =>
      aFarms.some((af) => af.globalFarmId.eq(gf.id)),
    )
    const yFarms = yieldFarms.data.filter((yf) =>
      aFarms.some((af) => af.yieldFarmId.eq(yf.id)),
    )

    const data = aFarms.map((farm) => {
      const gFarm = gFarms.find((gf) => gf.id.eq(farm.globalFarmId))
      const yFarm = yFarms.find((yf) => yf.id.eq(farm.yieldFarmId))

      if (!gFarm || !yFarm) return undefined

      const totalSharesZ = new BN(gFarm.totalSharesZ.toHex())
      const yieldPerPeriod = new BN(gFarm.yieldPerPeriod.toHex()).div(
        BN_QUINTILL,
      )
      const maxRewardPerPeriod = new BN(gFarm.maxRewardPerPeriod.toHex())
      const blocksPerPeriod = new BN(gFarm.blocksPerPeriod.toHex())
      const blockTime = new BN(6)
      const multiplier = new BN(yFarm.multiplier.toHex())

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

      return { apr, assetId: gFarm.rewardCurrency, ...farm }
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
