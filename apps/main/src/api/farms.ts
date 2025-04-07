import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { prop } from "remeda"

import { Papi, useRpcProvider } from "@/providers/rpcProvider"
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
) =>
  deposits.reduce<TFarmIds[]>((result, deposit) => {
    const missingEntries = deposit.yield_farm_entries.filter((entry) => {
      const isActive = activeFarms.some(
        (activeFarm) =>
          activeFarm.poolId === deposit.assetId &&
          activeFarm.yieldFarmId === entry.yield_farm_id.toString() &&
          activeFarm.globalFarmId === entry.global_farm_id.toString(),
      )
      return !isActive
    })

    missingEntries.forEach((entry) => {
      const isAlreadyInResult = result.some(
        (item) =>
          item.yieldFarmId === entry.yield_farm_id.toString() &&
          item.poolId === deposit.assetId.toString() &&
          item.globalFarmId === entry.global_farm_id.toString(),
      )

      if (!isAlreadyInResult) {
        result.push({
          yieldFarmId: entry.yield_farm_id.toString(),
          poolId: deposit.assetId,
          globalFarmId: entry.global_farm_id.toString(),
          isActive: false,
        })
      }
    })

    return result
  }, [])
