import { XCallEvm } from "@galacticcouncil/xcm-sdk"
import { Result as AbiDecoderResult } from "ethers/lib/utils"
import { utils } from "ethers"

/**
 * Splits a hex string by consecutive zeroes.
 */
export function splitHexByZeroes(hex: string) {
  if (typeof hex !== "string") return []

  return hex.replace("0x", "").split(/(0{3,})/g)
}

/**
 * Converts decoded EVM data to JSON format.
 */
export function decodedResultToJson(result: AbiDecoderResult) {
  if (!Array.isArray(result)) return {}
  return Object.entries(result).reduce((acc: any, [key, value]) => {
    if (isNaN(parseInt(key))) {
      acc[key] =
        Array.isArray(value) && value.every((v) => typeof v !== "string")
          ? decodedResultToJson(value)
          : value?._isBigNumber
            ? value.toString()
            : value
    }
    return acc
  }, {})
}

/**
 * Slices a hex string by a specified range.
 */
export function hexDataSlice(data: string, start: number, end?: number) {
  return `0x${data.substring(start, end)}`
}

/**
 * Decodes the XCallEvm data to JSON format and returns the method name.
 */
export function decodeXCallEvm(xcallEvm: XCallEvm) {
  if (!xcallEvm?.abi) return
  try {
    const iface = new utils.Interface(xcallEvm.abi)
    const decodedArgs = iface.decodeFunctionData(
      xcallEvm.data.slice(0, 10),
      xcallEvm.data,
    )
    const method = iface.getFunction(xcallEvm.data.slice(0, 10)).name

    return { data: decodedResultToJson(decodedArgs), method }
  } catch (error) {}
}
