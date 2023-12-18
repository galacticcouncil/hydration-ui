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
export function evmDataToJson(decodedData: any[]) {
  if (!Array.isArray(decodedData)) return {}
  return Object.entries(decodedData).reduce((acc: any, [key, value]) => {
    if (isNaN(parseInt(key))) {
      acc[key] =
        Array.isArray(value) && value.every((v) => typeof v !== "string")
          ? evmDataToJson(value)
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
