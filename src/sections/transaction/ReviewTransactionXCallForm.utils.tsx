import { XCall } from "@galacticcouncil/xcm-sdk"

export function isEvmXCall(x: XCall | undefined): x is XCall {
  return typeof x === "object" && "abi" in x && "data" in x
}
