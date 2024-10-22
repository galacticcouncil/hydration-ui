import { PalletLiquidityMiningLoyaltyCurve } from "@polkadot/types/lookup"
import { BN_QUINTILL } from "utils/constants"
import * as liquidityMining from "@galacticcouncil/math-liquidity-mining"
import BigNumber from "bignumber.js"

export const getCurrentLoyaltyFactor = (
  loyaltyCurve: PalletLiquidityMiningLoyaltyCurve,
  currentPeriod: BigNumber,
) => {
  return BigNumber(
    liquidityMining.calculate_loyalty_multiplier(
      currentPeriod.toFixed(),
      loyaltyCurve.initialRewardPercentage.toBigNumber().toFixed(),
      loyaltyCurve.scaleCoef.toBigNumber().toFixed(),
    ),
  )
    .div(BN_QUINTILL)
    .toNumber()
}
