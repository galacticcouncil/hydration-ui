import { Int, UInt } from "@polkadot/types"
import BigNumber from "bignumber.js"

Int.prototype.toBigNumber = function () {
  return new BigNumber(this.toHex())
}

UInt.prototype.toBigNumber = function () {
  return new BigNumber(this.toHex())
}
