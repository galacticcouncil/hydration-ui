import { Call } from "@galacticcouncil/xcm-sdk"

export function isEvmCall(x: Call | undefined): x is Call {
  return typeof x === "object" && "abi" in x && "data" in x
}
