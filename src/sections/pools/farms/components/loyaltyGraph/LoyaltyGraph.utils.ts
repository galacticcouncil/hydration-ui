import { BLOCK_TIME, BN_QUINTILL } from "utils/constants"
//import { PalletLiquidityMiningLoyaltyCurve } from "@polkadot/types/lookup"
import BN from "bignumber.js"
import type { worker as WorkerType } from "./LoyaltyGraph.worker"
import Worker from "./LoyaltyGraph.worker?worker"
import { wrap } from "comlink"
import { useQuery } from "@tanstack/react-query"
//import { AprFarm } from "utils/farms/apr"
import { Maybe, undefinedNoop } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"

const worker = wrap<typeof WorkerType>(new Worker())

export const useLoyaltyRates = (
  farm: any,
  loyaltyCurve: Maybe<any>,
  periodsInFarm?: BN,
) => {
  return useQuery(
    QUERY_KEYS.mathLoyaltyRates(
      farm.globalFarm.plannedYieldingPeriods,
      loyaltyCurve?.initialRewardPercentage,
      loyaltyCurve?.scaleCoef,
      periodsInFarm?.toString(),
    ),
    loyaltyCurve != null
      ? async () => {
          const periods = farm.globalFarm.plannedYieldingPeriods.toNumber()
          const initialRewardPercentage = loyaltyCurve.initialRewardPercentage
            .div(BN_QUINTILL)
            .toNumber()
          const scaleCoef = loyaltyCurve.scaleCoef.toNumber()

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
            y: new BN(y.rate).times(farm.apr.div(100)).toNumber(),
            currentLoyalty: y.currentLoyalty,
          }))
        }
      : undefinedNoop,
    { enabled: loyaltyCurve != null },
  )
}
