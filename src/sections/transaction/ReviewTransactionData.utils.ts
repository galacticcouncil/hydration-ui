import { Result as AbiDecoderResult } from "ethers/lib/utils"

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
