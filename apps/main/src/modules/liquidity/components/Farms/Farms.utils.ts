import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { wrap } from "comlink"

import { bestNumberQuery } from "@/api/chain"
import { Farm } from "@/api/farms"
import { useRpcProvider } from "@/providers/rpcProvider"
import { QUINTILL, RELAY_BLOCK_TIME } from "@/utils/consts"

import type { worker as WorkerType } from "./LoyaltyGraph.worker"
import Worker from "./LoyaltyGraph.worker?worker"

const worker = wrap<typeof WorkerType>(new Worker())

export const useFarmCurrentPeriod = () => {
  const { data } = useQuery(bestNumberQuery(useRpcProvider()))

  const relaychainBlockNumber = data?.relaychainBlockNumber

  const getCurrentPeriod = (blocksPerPeriod: string) =>
    relaychainBlockNumber
      ? Big(relaychainBlockNumber).div(blocksPerPeriod)
      : undefined

  const getSecondsToLeft = (estimatedEndBlock: string) =>
    relaychainBlockNumber
      ? Big(estimatedEndBlock)
          .minus(relaychainBlockNumber)
          .times(RELAY_BLOCK_TIME)
          .div(1000)
      : undefined

  return { getCurrentPeriod, getSecondsToLeft }
}

export const useLoyaltyRates = (farm: Farm, periodsInFarm?: number) => {
  const { loyaltyCurve, globalFarmId, plannedYieldingPeriods, apr } = farm

  return useQuery({
    queryKey: [globalFarmId, periodsInFarm?.toString()],
    queryFn: loyaltyCurve
      ? async () => {
          const periods = Number(plannedYieldingPeriods)
          const initialRewardPercentage = Big(
            loyaltyCurve.initial_reward_percentage.toString(),
          )
            .div(QUINTILL.toString())
            .toNumber()

          const axisScale = periods / 100

          const result = await worker.getLoyaltyFactor(
            periods,
            initialRewardPercentage,
            loyaltyCurve.scale_coef,
            periodsInFarm,
            axisScale,
          )

          return result.map((y, x) => ({
            x: new Big(x)
              .div(RELAY_BLOCK_TIME)
              .times(1000)
              .div(60)
              .div(24)
              .times(axisScale)
              .toNumber(),
            y: new Big(y.rate).times(Big(apr).div(100)).toNumber(),
            current: y.current,
          }))
        }
      : undefined,
    enabled: !!loyaltyCurve,
    staleTime: Infinity,
  })
}
