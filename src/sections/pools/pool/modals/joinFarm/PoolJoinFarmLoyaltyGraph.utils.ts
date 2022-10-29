import { BN_QUINTILL } from "utils/constants"
import { PalletLiquidityMiningLoyaltyCurve } from "@polkadot/types/lookup"

import type { worker as WorkerType } from "./PoolJoinFarmLoyaltyGraph.worker"
import Worker from "./PoolJoinFarmLoyaltyGraph.worker?worker"

import { wrap } from "comlink"
import { useQuery } from "@tanstack/react-query"
import { AprFarm } from "utils/farms/apr"
import { Maybe, undefinedNoop } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"

const worker = wrap<typeof WorkerType>(new Worker())

export const useLoyaltyRates = (
  farm: AprFarm,
  loyaltyCurve: Maybe<PalletLiquidityMiningLoyaltyCurve>,
) => {
  return useQuery(
    QUERY_KEYS.mathLoyaltyRates(
      farm.globalFarm.plannedYieldingPeriods,
      loyaltyCurve?.initialRewardPercentage,
      loyaltyCurve?.scaleCoef,
    ),
    loyaltyCurve != null
      ? async () => {
          const periods = farm.globalFarm.plannedYieldingPeriods.toNumber()
          const initialRewardPercentage = loyaltyCurve.initialRewardPercentage
            .toBigNumber()
            .div(BN_QUINTILL)
            .toNumber()
          const scaleCoef = loyaltyCurve.scaleCoef.toNumber()

          const result = await worker.getLoyaltyFactor(
            periods,
            initialRewardPercentage,
            scaleCoef,
          )

          return result.map((y, x) => ({ x, y }))
        }
      : undefinedNoop,
    { enabled: loyaltyCurve != null },
  )
}
