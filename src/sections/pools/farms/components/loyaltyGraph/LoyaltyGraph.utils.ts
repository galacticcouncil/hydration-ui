import { BLOCK_TIME, BN_QUINTILL } from "utils/constants"
import BN, { BigNumber } from "bignumber.js"
import type { worker as WorkerType } from "./LoyaltyGraph.worker"
import Worker from "./LoyaltyGraph.worker?worker"
import { wrap } from "comlink"
import { useQuery } from "@tanstack/react-query"
import { undefinedNoop } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { TFarmAprData } from "api/farms"

const worker = wrap<typeof WorkerType>(new Worker())

export const useLoyaltyRates = (
  farm: TFarmAprData,
  apr: BigNumber | undefined,
  loyaltyCurve: { initialRewardPercentage: string; scaleCoef: string },
  periodsInFarm?: BN,
) => {
  return useQuery(
    QUERY_KEYS.mathLoyaltyRates(
      farm.plannedYieldingPeriods,
      loyaltyCurve?.initialRewardPercentage,
      loyaltyCurve?.scaleCoef,
      periodsInFarm?.toString(),
    ),
    loyaltyCurve != null && apr
      ? async () => {
          const periods = Number(farm.plannedYieldingPeriods)
          const initialRewardPercentage = BN(
            loyaltyCurve.initialRewardPercentage,
          )
            .div(BN_QUINTILL)
            .toNumber()
          const scaleCoef = Number(loyaltyCurve.scaleCoef)

          const axisScale = periods / 100

          const result = await worker.getLoyaltyFactor(
            periods,
            initialRewardPercentage,
            scaleCoef,
            periodsInFarm?.toNumber(),
            axisScale,
          )

          return result.map((y, x) => ({
            x: new BN(x)
              .div(BLOCK_TIME)
              .div(60)
              .div(24)
              .multipliedBy(axisScale)
              .toNumber(),
            y: new BN(y.rate).times(apr.div(100)).toNumber(),
            current: y.current,
          }))
        }
      : undefinedNoop,
    { enabled: loyaltyCurve != null },
  )
}
