import BigNumber from "bignumber.js"
import { BN_0 } from "utils/constants"

export const formatValue = (value?: BigNumber, decimals?: number) => {
  if (!value) {
    return BN_0
  }

  return value.shiftedBy(-(decimals ?? 12)).dp(0)
}
