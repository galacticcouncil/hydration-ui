import { BN_QUINTILL } from "utils/constants"
import * as liquidityMining from "@galacticcouncil/math-liquidity-mining"
import BigNumber from "bignumber.js"

export const getCurrentLoyaltyFactor = (
  loyaltyCurve: { initialRewardPercentage: string; scaleCoef: string },
  currentPeriod: BigNumber,
) => {
  return BigNumber(
    liquidityMining.calculate_loyalty_multiplier(
      currentPeriod.toFixed(),
      loyaltyCurve.initialRewardPercentage,
      loyaltyCurve.scaleCoef,
    ),
  )
    .div(BN_QUINTILL)
    .toString()
}
