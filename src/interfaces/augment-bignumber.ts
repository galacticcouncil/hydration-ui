import { Int } from "@polkadot/types"
import BigNumber from "bignumber.js"

Int.prototype.toBigNumber = function () {
  return new BigNumber(this.toHex())
}
