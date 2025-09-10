import { OmnipoolWarehouseLMDepositYieldFarmEntry } from "@galacticcouncil/sdk-next/build/types/client/LiquidityMiningClient"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { prop } from "remeda"

import { Papi, TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { useAccountData } from "@/states/account"
import { useOmnipoolIds } from "@/states/liquidity"

import { OmnipoolDepositFull } from "./account"

type TFarmIds = {
  poolId: string
  globalFarmId: string
  yieldFarmId: string
  isActive: boolean
}

export const useOmnipoolFarms = () => {
  const { ids = [] } = useOmnipoolIds()
  const { papi, isLoaded } = useRpcProvider()
  const positions = useAccountData(prop("positions"))

  const { omnipoolMining } = positions

  const { data: activeFarms } = useQuery({
    queryKey: ["omnipoolActiveFarms"],
    queryFn: getActiveFarms(papi, ids),
    enabled: !!ids.length && isLoaded,
    staleTime: Infinity,
  })

  const stoppedFarms = useMemo(
    () => getStoppedFarms(omnipoolMining, activeFarms ?? []),
    [activeFarms, omnipoolMining],
  )
  return { activeFarms, stoppedFarms }
}

const getActiveFarms =
  (api: Papi, ids: string[], isXyk: boolean = false) =>
  async () => {
    const activeFarms = await Promise.all(
      ids.map((id) =>
        isXyk
          ? api.query.XYKWarehouseLM.ActiveYieldFarm.getEntries(id)
          : api.query.OmnipoolWarehouseLM.ActiveYieldFarm.getEntries(
              Number(id),
            ),
      ),
    )

    const activeFarmIds = activeFarms.flatMap((farm) =>
      farm.map(({ keyArgs, value }) => {
        const [poolIdRaw, globalFarmIdRaw] = keyArgs

        const yieldFarmId = value.toString()
        const poolId = poolIdRaw.toString()
        const globalFarmId = globalFarmIdRaw.toString()

        return {
          poolId,
          globalFarmId,
          yieldFarmId,
          isActive: true,
        }
      }),
    )

    return activeFarmIds
  }

const getStoppedFarms = (
  deposits: OmnipoolDepositFull[],
  activeFarms: TFarmIds[],
) => {
  const activeFarmSet = new Set(
    activeFarms.map(
      (farm) => `${farm.poolId}-${farm.yieldFarmId}-${farm.globalFarmId}`,
    ),
  )

  const resultMap = new Map<string, TFarmIds>()

  deposits.forEach((deposit) => {
    deposit.yield_farm_entries.forEach((entry) => {
      const yieldFarmIdStr = entry.yield_farm_id.toString()
      const globalFarmIdStr = entry.global_farm_id.toString()
      const key = `${deposit.assetId}-${yieldFarmIdStr}-${globalFarmIdStr}`

      if (!activeFarmSet.has(key) && !resultMap.has(key)) {
        const farmEntry = {
          yieldFarmId: yieldFarmIdStr,
          poolId: deposit.assetId,
          globalFarmId: globalFarmIdStr,
          isActive: false,
        }
        resultMap.set(key, farmEntry)
      }
    })
  })

  return Array.from(resultMap.values())
}

export const depositRewardsQuery = (
  { sdk, isApiLoaded }: TProviderContext,
  poolId: string,
  farm: OmnipoolWarehouseLMDepositYieldFarmEntry,
  isXyk: boolean,
  relayBlockChainNumber: number,
) =>
  queryOptions({
    queryKey: ["farmRewards", poolId, farm.yield_farm_id, isXyk],
    queryFn: () =>
      sdk.client.mining.getDepositReward(
        poolId,
        farm,
        isXyk,
        relayBlockChainNumber,
      ),
    enabled: isApiLoaded && !!relayBlockChainNumber,
  })
