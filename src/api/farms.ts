import { ApiPromise } from "@polkadot/api"
import { useApiPromise } from "utils/network"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { u32 } from "@polkadot/types-codec"
import { AccountId32 } from "@polkadot/types/interfaces/runtime"

export const useYieldFarms = (ids: FarmIds[]) => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.yieldFarms(ids), getYieldFarms(api, ids), {
    enabled: !!ids.length,
  })
}

export const useYieldFarm = (ids: FarmIds) => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.yieldFarm(ids), getYieldFarm(api, ids), {
    enabled: !!ids,
  })
}

export const useActiveYieldFarms = (poolId: AccountId32 | string) => {
  const api = useApiPromise()
  return useQuery(
    QUERY_KEYS.activeYieldFarms(poolId),
    getActiveYieldFarms(api, poolId),
  )
}

export const useGlobalFarms = (ids: u32[]) => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.globalFarms(ids), getGlobalFarms(api, ids), {
    enabled: !!ids.length,
  })
}

export const useGlobalFarm = (id: u32) => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.globalFarm(id), getGlobalFarm(api, id))
}

export const getYieldFarms = (api: ApiPromise, ids: FarmIds[]) => async () => {
  const reqs = ids.map(({ poolId, globalFarmId, yieldFarmId }) =>
    api.query.warehouseLM.yieldFarm(poolId, globalFarmId, yieldFarmId),
  )
  const res = await Promise.all(reqs)
  const farms = res.map((data) => data.unwrap())

  return farms
}

export const getYieldFarm =
  (api: ApiPromise, { yieldFarmId, globalFarmId, poolId }: FarmIds) =>
  async () => {
    const res = await api.query.warehouseLM.yieldFarm(
      poolId,
      globalFarmId,
      yieldFarmId,
    )
    const farm = res.unwrap()

    return farm
  }

export const getActiveYieldFarms =
  (api: ApiPromise, poolId: AccountId32 | string) => async () => {
    const res = await api.query.warehouseLM.activeYieldFarm.entries(poolId)

    const data = res.map(([storageKey, data]) => {
      const [poolId, globalFarmId] = storageKey.args
      const yieldFarmId = data.unwrap()

      return {
        poolId,
        globalFarmId,
        yieldFarmId,
      }
    })

    return data
  }

export const getGlobalFarms = (api: ApiPromise, ids: u32[]) => async () => {
  const reqs = ids.map((id) => api.query.warehouseLM.globalFarm(id))
  const res = await Promise.all(reqs)
  const farms = res.map((data) => data.unwrap())

  return farms
}

export const getGlobalFarm = (api: ApiPromise, id: u32) => async () => {
  const res = await api.query.warehouseLM.globalFarm(id)
  const farm = res.unwrap()

  return farm
}

export interface FarmIds {
  poolId: AccountId32
  globalFarmId: u32
  yieldFarmId: u32
}
